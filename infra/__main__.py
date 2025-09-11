from __future__ import annotations

import json
from typing import Dict

import pulumi
import pulumi_aws as aws
import pulumi_docker as docker

# Project/stack info
project_name = pulumi.get_project()
stack_name = pulumi.get_stack()

# ECR repository to store the Lambda container image
repo = aws.ecr.Repository(
    "votekit-lambda-repo",
)

# Get ECR auth credentials for the Docker registry
auth = aws.ecr.get_authorization_token_output(registry_id=repo.registry_id)
registry = docker.Registry(
    server=repo.repository_url.apply(lambda url: url.split("/")[0]),
    username=auth.user_name,
    password=auth.password,
)

# Build and push the Lambda image from the local lambda directory
image = docker.Image(
    "votekit-lambda-image",
    build=docker.DockerBuild(
        context="../lambda",
        dockerfile="../lambda/Dockerfile",
    ),
    image_name=repo.repository_url.apply(lambda url: f"{url}:latest"),
    registry=registry,
)

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
    image_uri=image.image_name,
    role=lambda_exec_role.arn,
    timeout=15,
    memory_size=256,
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
