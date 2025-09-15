# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated deployment and CI/CD.

## Deploy Infrastructure Workflow

The `deploy-infrastructure.yml` workflow automatically deploys the Pulumi infrastructure when changes are pushed to the `main` branch.

### Trigger Conditions

- **Automatic**: Pushes to `main` branch that modify:
  - `infra/**` files
  - `lambda/**` files  
  - `docker-compose.yml`
- **Manual**: Can be triggered manually via GitHub Actions UI

### Required GitHub Secrets

Before using this workflow, you must configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

#### `AWS_ACCESS_KEY_ID`
- Your AWS Access Key ID
- Must have the permissions defined in the infrastructure deployment policy
- Example: `AKIAIOSFODNN7EXAMPLE`

#### `AWS_SECRET_ACCESS_KEY`
- Your AWS Secret Access Key
- Corresponds to the Access Key ID above
- Example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### Workflow Steps

1. **Checkout code** - Downloads the repository code
2. **Set up Docker Buildx** - Prepares Docker for building
3. **Build infrastructure container** - Builds the Pulumi container image
4. **Configure AWS credentials** - Creates temporary `.env` file with secrets
5. **Deploy infrastructure** - Runs Pulumi deployment in container
6. **Clean up** - Removes temporary files
7. **Output results** - Shows deployment status

### Security Features

- AWS credentials are only available during workflow execution
- Temporary `.env` file is created and immediately deleted
- Secrets are never logged or exposed in workflow output
- Uses Docker container isolation for deployment

### Monitoring

- Check the **Actions** tab in your GitHub repository to view workflow runs
- Failed deployments will show detailed error logs
- Successful deployments will display confirmation messages

### Troubleshooting

Common issues and solutions:

1. **AWS Credentials Error**: Verify secrets are correctly set in repository settings
2. **S3 Backend Access**: Ensure the AWS credentials have S3 permissions for the Pulumi backend bucket
3. **Docker Build Failure**: Check that the `infra/Dockerfile` is valid and dependencies are correct
4. **Pulumi Stack Issues**: Verify the stack name and backend configuration

### Manual Deployment

To trigger a manual deployment:

1. Go to **Actions** tab in your repository
2. Select **Deploy Infrastructure** workflow
3. Click **Run workflow**
4. Choose the branch (usually `main`)
5. Click **Run workflow** button
