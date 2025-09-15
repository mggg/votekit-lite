#!/bin/bash

# Script to build and push the Lambda Docker image to ECR
# This avoids Docker-in-Docker issues with Pulumi

set -e

# Get AWS account ID and region
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
echo "Using AWS Account ID: ${AWS_ACCOUNT_ID}"
AWS_REGION=${AWS_REGION:-us-east-2}
ECR_REPO_NAME="votekit-lambda-repo"

# ECR repository URL
ECR_REPO_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "Building and pushing Lambda image to ECR..."
echo "Repository URL: ${ECR_REPO_URL}"

# Create ECR repository if it doesn't exist
echo "Checking if ECR repository exists..."
if ! aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} >/dev/null 2>&1; then
    echo "Creating ECR repository: ${ECR_REPO_NAME}"
    aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${AWS_REGION}
else
    echo "ECR repository already exists: ${ECR_REPO_NAME}"
fi

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_URL}

# Build the image for linux/amd64 platform with Lambda-compatible format
echo "Building Docker image..."
# Use legacy builder to avoid OCI manifest issues with Lambda
# Build with explicit platform and no cache to ensure clean build
# Force the image to be built in the correct format for Lambda
DOCKER_BUILDKIT=0 docker build --platform linux/arm64 --no-cache -t ${ECR_REPO_NAME} ./lambda

# Tag the image
echo "Tagging image..."
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URL}:latest

# Push the image with specific format for AWS Lambda
echo "Pushing image to ECR..."
docker push ${ECR_REPO_URL}:latest

echo "Successfully built and pushed Lambda image to ECR!"
echo "Image URI: ${ECR_REPO_URL}:latest"
