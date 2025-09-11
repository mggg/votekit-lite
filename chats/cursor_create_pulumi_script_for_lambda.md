# Create pulumi script for lambda infrastructure
_Exported on 9/11/2025 at 10:07:40 CDT from Cursor (1.5.11)_

---

**User**

Add to the infrastructure field. It should be a pulumi script that creates a lambda endpoint and IAM role with permissions to invoke it. It should dockerize the main function of the `lambda` directory. 

Make sure the infra runs in its own docker container. 

Update docker-compose to use the infra folder as needed

---

**Cursor**

I'll start by scanning the repository to see the current `docker-compose.yml` and inspect the `infra` and `lambda` directories to design the Pulumi setup and necessary Dockerfiles. Then I'll create the Pulumi project, Dockerfile for the infra container, and update docker-compose accordingly.

I'll open the `lambda` directory to confirm how the Lambda is built today and what artifacts we can re-use for the container image and the endpoint. Then I’ll scaffold a Pulumi project under `infra/` with code to build/push an image, create an IAM role, Lambda function, permission, and an HTTP API Gateway integration, and add a Dockerfile for the infra container and update docker-compose.


I'll add a Pulumi Python project under `infra/` to build and deploy a Lambda (container image) with an API Gateway endpoint, create an IAM role that can invoke it, add a Dockerfile and entrypoint to run Pulumi inside a container, and update `docker-compose.yml` to include and wire up the infra service.

```yaml
*** Begin Patch
*** Add File: /Users/dylanhalpern/Documents/GitHub/votekit-frontend/infra/Pulumi.yaml
name: votekit-infra
runtime:
  name: python
  options:
    virtualenv: venv
description: Infrastructure for votekit - Lambda (container), API endpoint, and IAM role
*** End Patch
```

I'll create the Pulumi project files under `infra/`, add an infra Dockerfile, and update docker-compose to run the infra as its own container that builds and deploys the Lambda container image and API endpoint.

```yaml
name: votekit-infra
runtime:
  name: python
  options:
    virtualenv: venv
description: Infrastructure for votekit - Lambda (container), API endpoint, and IAM role
```

```yaml
config:
  aws:region: us-east-1
```

```pip-requirements
pulumi>=3.120.0
pulumi-aws>=6.32.0
pulumi-docker>=4.5.4
```

```dockerfile
# syntax=docker/dockerfile:1

FROM pulumi/pulumi:latest

# Install Python and Docker CLI for building/pushing images
RUN apk add --no-cache python3 py3-pip docker-cli bash git jq

WORKDIR /workspace/infra

# Install Python dependencies at build time (cache-friendly)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy only infra sources (compose will also mount the repo at runtime)
COPY . .

ENV PULUMI_SKIP_UPDATE_CHECK=true

CMD ["sh", "-lc", "pulumi login --local && (pulumi stack select dev || pulumi stack init dev) && pulumi up --yes --stack dev"]
```

```python
from __future__ import annotations

import json
from typing import Dict

import pulumi
from pulumi import Output
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
auth = aws.ecr.get_authorization_token(registry_id=repo.registry_id)
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

# HTTP API Gateway -> Lambda proxy integration
api = aws.apigatewayv2.Api(
    "votekit-api",
    protocol_type="HTTP",
)

integration = aws.apigatewayv2.Integration(
    "votekit-api-integration",
    api_id=api.id,
    integration_type="AWS_PROXY",
    integration_uri=fn.arn,
    payload_format_version="2.0",
)

route = aws.apigatewayv2.Route(
    "votekit-api-route",
    api_id=api.id,
    route_key="$default",
    target=Output.concat("integrations/", integration.id),
)

stage = aws.apigatewayv2.Stage(
    "votekit-api-stage",
    api_id=api.id,
    name="$default",
    auto_deploy=True,
)

# Allow API Gateway to invoke the Lambda
aws.lambda_.Permission(
    "votekit-allow-apigw",
    action="lambda:InvokeFunction",
    function=fn.name,
    principal="apigateway.amazonaws.com",
    source_arn=Output.concat(api.execution_arn, "/*/*"),
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
pulumi.export("api_endpoint", api.api_endpoint)
pulumi.export("invoker_role_arn", invoker_role.arn)
```

I'm creating a todo list to track the infrastructure work and will start updating the docker-compose to add the infra service now.

I'll update docker-compose to add an infra service that runs the Pulumi container, mounting the repo so it can build the lambda image and access AWS credentials.

I'll add an `infra` service to `docker-compose.yml` that builds and runs the Pulumi program in its own container, with mounts for the repository, Docker socket, and AWS credentials, and set `PULUMI_HOME` to persist state inside `infra/.pulumi`.

```dockercompose
version: '3.9'

services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
    container_name: votekit-app
    command: sh -c "pnpm i && pnpm dev --host 0.0.0.0 --port 5173"
    volumes:
      - ./app:/app
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=5173
    depends_on:
      - lambda

  lambda:
    build:
      context: ./lambda
      dockerfile: Dockerfile.dev
    container_name: votekit-lambda-dev
    volumes:
      - ./lambda:/app
    ports:
      - "8000:8000"

  infra:
    build:
      context: ./infra
      dockerfile: Dockerfile
    container_name: votekit-infra
    working_dir: /workspace/infra
    command: sh -lc "pulumi login --local && (pulumi stack select dev || pulumi stack init dev) && pulumi up --yes --stack dev"
    volumes:
      - ./:/workspace
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.aws:/root/.aws:ro
    environment:
      - PULUMI_HOME=/workspace/infra/.pulumi
      - AWS_REGION=us-east-1
      - AWS_PROFILE=default
    depends_on: []

```

- I scaffolded `infra/` with a Pulumi Python project that:
  - Builds and pushes the `lambda` image to ECR.
  - Creates a Lambda function from that container image.
  - Provisions an HTTP API Gateway endpoint and permission to invoke the Lambda.
  - Creates an IAM role with permissions to invoke the Lambda.
- I added an infra container (`infra/Dockerfile`) that runs Pulumi in its own container.
- I updated `docker-compose.yml` to include an `infra` service that runs the Pulumi deployment with local Pulumi state, Docker socket, and AWS credentials mounted.

How to deploy:
- Ensure your AWS creds are available in `~/.aws` with the right account/region (defaults to `us-east-1`).
- Run: docker compose up infra

Exports you’ll get from Pulumi:
- lambda_function_name
- lambda_function_arn
- api_endpoint
- invoker_role_arn

---

**User**

This is close but we'll invoke invoke the function directly using a Nodejs function in the fullstack framework. No need for the API gateway

---

**Cursor**

I'll remove the API Gateway resources and outputs from the Pulumi program so the Lambda can be invoked directly by your Node.js code.

```python
from __future__ import annotations

import json
from typing import Dict

import pulumi
from pulumi import Output
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
auth = aws.ecr.get_authorization_token(registry_id=repo.registry_id)
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

```

I removed the API Gateway resources from the Pulumi program and will add a todo entry to reflect this change. Then I'll verify the Pulumi file looks clean.

I'll fix the ECR authorization in the Pulumi program to avoid using an Output where a plain value is required, then mark the task complete.

I'll update the Pulumi program to use the output-variant for ECR auth and remove the unused Output import, then check for linter issues in the edited file.

```python
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

```

- Removed API Gateway resources; infra now only provisions the Lambda (container image), its execution role, and a separate IAM role allowed to invoke it.
- Fixed ECR authorization to use the output form for compatibility with Pulumi outputs.

Invoke guidance from Node.js:
- Use AWS SDK v3 (`@aws-sdk/client-lambda`) from your fullstack server code to call the function by name.
- The role `invoker_role_arn` can be assumed by your account; attach it to the runtime that should perform invokes, or grant your current role permissions to invoke the function directly.

If you want, I can add a small Node server util that invokes the function.

