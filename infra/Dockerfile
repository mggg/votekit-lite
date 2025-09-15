FROM python:3.12-alpine

# Install Docker CLI, bash, git, jq, and other dependencies
RUN apk add --no-cache docker-cli bash git jq curl

WORKDIR /workspace/infra

# Install Pulumi (latest stable)
RUN curl -fsSL https://get.pulumi.com | sh && \
    ln -s /root/.pulumi/bin/pulumi /usr/local/bin/pulumi

# Install Python dependencies at build time (cache-friendly)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy only infra sources (compose will also mount the repo at runtime)
COPY . .

ENV PULUMI_SKIP_UPDATE_CHECK=true

CMD ["sh", "-lc", "pulumi login s3://votekit-frontend-pulumi-backend && (pulumi stack select dev || pulumi stack init dev) && pulumi up --yes --stack dev"]
