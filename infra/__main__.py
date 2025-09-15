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
        "variables": {}
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

# Exports
pulumi.export("lambda_function_name", fn.name)
pulumi.export("lambda_function_arn", fn.arn)
pulumi.export("invoker_role_arn", invoker_role.arn)
pulumi.export("pulumi_backend_bucket", pulumi_backend_bucket.bucket)
