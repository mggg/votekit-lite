from __future__ import annotations

import json
from typing import Dict

import pulumi
import pulumi_aws as aws
import pulumi_docker as docker

# Project/stack info
project_name = pulumi.get_project()
stack_name = pulumi.get_stack()

# S3 bucket for Pulumi backend storage
# Reference existing bucket instead of creating new one
pulumi_backend_bucket = aws.s3.Bucket.get(
    "votekit-frontend-pulumi-backend",
    id="votekit-frontend-pulumi-backend",
    bucket="votekit-frontend-pulumi-backend",
)

# Note: Since we're using an existing bucket, we don't configure versioning, encryption, or public access blocks
# These should already be configured on the existing bucket. If you need to modify them,
# you would need to use separate aws.s3.BucketVersioning, aws.s3.BucketServerSideEncryptionConfiguration,
# and aws.s3.BucketPublicAccessBlock resources, but be careful not to conflict with existing settings.

# Reference existing ECR repository instead of creating a new one
# This avoids the repository name mismatch issue
repo = aws.ecr.Repository.get(
    "votekit-lambda-repo",
    id="votekit-lambda-repo"
)

# For now, let's use a simple approach - build the image manually
# and reference it by the repository URL. This avoids Docker-in-Docker issues.
# The image will need to be built and pushed manually before running this.
image_uri = repo.repository_url.apply(lambda url: f"{url}:latest")

# Lambda execution role
assume_role_doc: Dict[str, object] = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Effect": "Allow",
        }
    ],
}

lambda_exec_role = aws.iam.Role(
    "votekit-lambda-exec-role",
    assume_role_policy=json.dumps(assume_role_doc),
)

aws.iam.RolePolicyAttachment(
    "votekit-lambda-basic-logs",
    role=lambda_exec_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
)

# Lambda function using the container image
fn = aws.lambda_.Function(
    "votekit-lambda",
    package_type="Image",
    image_uri=image_uri,
    role=lambda_exec_role.arn,
    timeout=30,
    memory_size=4096,
    # Add these parameters to help with image compatibility
    architectures=["arm64"],
    environment={
        "variables": {
            "NUMBA_CACHE_DIR": "/tmp/numba_cache"
        }
    }
)

# Create an IAM role that can be assumed by the account root and can invoke the Lambda
caller = aws.get_caller_identity()
invoker_assume_role_doc = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {"AWS": f"arn:aws:iam::{caller.account_id}:root"},
            "Effect": "Allow",
        }
    ],
}

invoker_role = aws.iam.Role(
    "votekit-invoker-role",
    assume_role_policy=json.dumps(invoker_assume_role_doc),
)

invoke_policy_doc = aws.iam.get_policy_document(
    statements=[
        aws.iam.GetPolicyDocumentStatementArgs(
            effect="Allow",
            actions=["lambda:InvokeFunction", "lambda:InvokeAsync"],
            resources=[fn.arn],
        )
    ]
)

aws.iam.RolePolicy(
    "votekit-invoke-lambda-policy",
    role=invoker_role.id,
    policy=invoke_policy_doc.json,
)

# -----------------------------
# Results S3 + CloudFront CDN
# -----------------------------

# Results bucket (private; accessed via CloudFront OAC)
results_bucket = aws.s3.Bucket(
    "votekit-results-bucket",
    bucket=f"votekit-results-{stack_name}",
)

# Block public access for safety
aws.s3.BucketPublicAccessBlock(
    "votekit-results-public-access-block",
    bucket=results_bucket.id,
    block_public_acls=True,
    block_public_policy=True,
    ignore_public_acls=True,
    restrict_public_buckets=True,
)

# CORS for direct browser access if needed
aws.s3.BucketCorsConfigurationV2(
    "votekit-results-cors",
    bucket=results_bucket.id,
    cors_rules=[
        aws.s3.BucketCorsConfigurationV2CorsRuleArgs(
            allowed_headers=["*"],
            allowed_methods=["GET", "HEAD", "PUT", "POST"],
            allowed_origins=["*"],
            expose_headers=["ETag"],
            max_age_seconds=300,
        )
    ],
)

# CloudFront Origin Access Control (OAC)
oac = aws.cloudfront.OriginAccessControl(
    "votekit-results-oac",
    description="OAC for votekit results bucket",
    origin_access_control_origin_type="s3",
    signing_behavior="always",
    signing_protocol="sigv4",
)

# Use AWS managed CORS response headers policy for CloudFront
managed_cors_policy = aws.cloudfront.get_response_headers_policy(
    name="Managed-CORS-With-Preflight",
)

# CloudFront distribution in front of the results bucket
distribution = aws.cloudfront.Distribution(
    "votekit-results-cdn",
    enabled=True,
    origins=[
        aws.cloudfront.DistributionOriginArgs(
            origin_id="s3-results-origin",
            domain_name=results_bucket.bucket_regional_domain_name,
            s3_origin_config=aws.cloudfront.DistributionOriginS3OriginConfigArgs(
                origin_access_identity=None,
            ),
            origin_access_control_id=oac.id,
        )
    ],
    default_cache_behavior=aws.cloudfront.DistributionDefaultCacheBehaviorArgs(
        target_origin_id="s3-results-origin",
        viewer_protocol_policy="redirect-to-https",
        allowed_methods=["GET", "HEAD", "OPTIONS"],
        cached_methods=["GET", "HEAD", "OPTIONS"],
        forwarded_values=aws.cloudfront.DistributionDefaultCacheBehaviorForwardedValuesArgs(
            query_string=True,
            cookies=aws.cloudfront.DistributionDefaultCacheBehaviorForwardedValuesCookiesArgs(
                forward="none",
            ),
        ),
        compress=True,
        response_headers_policy_id=managed_cors_policy.id,
    ),
    price_class="PriceClass_100",
    restrictions=aws.cloudfront.DistributionRestrictionsArgs(
        geo_restriction=aws.cloudfront.DistributionRestrictionsGeoRestrictionArgs(
            restriction_type="none",
        )
    ),
    viewer_certificate=aws.cloudfront.DistributionViewerCertificateArgs(
        cloudfront_default_certificate=True,
    ),
)

# Allow CloudFront distribution (via OAC) to read from the bucket
bucket_policy_doc = aws.iam.get_policy_document(
    statements=[
        aws.iam.GetPolicyDocumentStatementArgs(
            effect="Allow",
            principals=[aws.iam.GetPolicyDocumentStatementPrincipalArgs(
                type="Service",
                identifiers=["cloudfront.amazonaws.com"],
            )],
            actions=["s3:GetObject"],
            resources=[results_bucket.arn.apply(lambda a: f"{a}/*")],
            conditions=[
                aws.iam.GetPolicyDocumentStatementConditionArgs(
                    test="StringEquals",
                    variable="AWS:SourceArn",
                    values=[distribution.arn],
                )
            ],
        )
    ]
)

aws.s3.BucketPolicy(
    "votekit-results-bucket-policy",
    bucket=results_bucket.id,
    policy=bucket_policy_doc.json,
)

# Allow Lambda execution role to write results to the bucket
lambda_s3_write_policy_doc = aws.iam.get_policy_document(
    statements=[
        aws.iam.GetPolicyDocumentStatementArgs(
            effect="Allow",
            actions=[
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:ListBucket",
            ],
            resources=[
                results_bucket.arn,
                results_bucket.arn.apply(lambda a: f"{a}/*"),
            ],
        )
    ]
)

aws.iam.RolePolicy(
    "votekit-lambda-s3-results-write",
    role=lambda_exec_role.id,
    policy=lambda_s3_write_policy_doc.json,
)

# Exports
pulumi.export("lambda_function_name", fn.name)
pulumi.export("lambda_function_arn", fn.arn)
pulumi.export("invoker_role_arn", invoker_role.arn)
pulumi.export("pulumi_backend_bucket", pulumi_backend_bucket.bucket)
pulumi.export("results_bucket_name", results_bucket.bucket)
pulumi.export("results_cdn_domain", distribution.domain_name)
pulumi.export("results_cdn_id", distribution.id)
