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

# Detect host architecture
HOST_ARCH=$(uname -m)
echo "Detected host architecture: ${HOST_ARCH}"

if [ "${HOST_ARCH}" = "aarch64" ] || [ "${HOST_ARCH}" = "arm64" ]; then
    echo "Building natively for ARM64..."
    docker build \
      --no-cache \
      --output type=docker,dest=./image.tar \
      ./lambda

    docker load < ./image.tar
    IMAGE_ID=$(docker images --format "{{.ID}}" | head -n1)
    docker tag $IMAGE_ID ${ECR_REPO_URL}:latest
else
    echo "Building for ARM64 on x86 using buildx..."
    docker buildx build \
      --platform linux/arm64 \
      --no-cache \
      --output type=docker,dest=./image.tar \
      ./lambda

    docker load < ./image.tar

    IMAGE_ID=$(docker images --format "{{.ID}}" | head -n1)
    docker tag $IMAGE_ID ${ECR_REPO_URL}:latest
fi

echo "Pushing image to ECR..."
docker push ${ECR_REPO_URL}:latest

echo "Successfully built and pushed Lambda image to ECR!"
echo "Image URI: ${ECR_REPO_URL}:latest"
