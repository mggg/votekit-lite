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
