# votekit Lambda (Container via ECR)

This directory contains a minimal Python AWS Lambda packaged as a container image and deployed via Amazon ECR.

## Files
- `main.py`: Lambda handler (`main.handler`).
- `Dockerfile`: Uses `public.ecr.aws/lambda/python:3.11` and sets CMD to `main.handler`.
- `.dockerignore`: Excludes local-only files from the image context.
- `requirements.txt`: Python dependencies (optional).

## Prerequisites
- AWS account with permissions for ECR and Lambda
- AWS CLI v2 configured (`aws configure`)
- Docker

## Build and Push Image to ECR
Replace placeholders before running. Use a unique version tag.

```bash
AWS_ACCOUNT_ID="123456789012"
AWS_REGION="us-east-2"
ECR_REPO_NAME="votekit-lambda"
IMAGE_TAG="v1"

# Create ECR repo if it doesn't exist
aws ecr describe-repositories --repository-names "$ECR_REPO_NAME" --region "$AWS_REGION" >/dev/null 2>&1 || \
aws ecr create-repository --repository-name "$ECR_REPO_NAME" --region "$AWS_REGION"

# Login to ECR
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build image
DOCKER_BUILDKIT=1 docker build -t "$ECR_REPO_NAME:$IMAGE_TAG" .

# Tag and push
docker tag "$ECR_REPO_NAME:$IMAGE_TAG" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"
```

## Create/Update Lambda from Image
```bash
LAMBDA_FUNCTION_NAME="votekit-lambda"
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"

# Create function if it doesn't exist
aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1 || \
aws lambda create-function \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --package-type Image \
  --code ImageUri="$IMAGE_URI" \
  --role "arn:aws:iam::$AWS_ACCOUNT_ID:role/service-role/lambda-basic-exec" \
  --timeout 10 \
  --memory-size 256 \
  --region "$AWS_REGION"

# Update function to latest image
aws lambda update-function-code \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --image-uri "$IMAGE_URI" \
  --region "$AWS_REGION"
```

## Test local functions and unit tests
We use doctests for local function coverage.

```bash
docker-compose exec lambda sh
python main.py -v
```

## Test Invocation
```bash
aws lambda invoke \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --payload '{"ping":"pong"}' \
  --cli-binary-format raw-in-base64-out \
  --region "$AWS_REGION" \
  response.json
cat response.json | jq .
```



## Notes
- Adjust the IAM role ARN to a role with `AWSLambdaBasicExecutionRole` policy.
- Add Python deps to `requirements.txt`; they will be copied into the image layer.
- Change the runtime base image if you need a different Python version.
