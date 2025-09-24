# -------- Stage 1: Build dependencies --------
FROM public.ecr.aws/lambda/python:3.13 AS build

# Install build tools and git
RUN dnf update -y && \
    dnf install -y git gcc gcc-c++ make automake autoconf libtool && \
    dnf clean all && \
    rm -rf /var/cache/dnf

# Copy requirements and install them into a build directory
WORKDIR /tmp
COPY requirements.txt ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt -t /tmp/python; fi

# -------- Stage 2: Final runtime image --------
FROM public.ecr.aws/lambda/python:3.13

# Copy function code
COPY main.py ${LAMBDA_TASK_ROOT}/
COPY common_schema.py ${LAMBDA_TASK_ROOT}/

# Copy installed dependencies from build stage into Lambda task root
COPY --from=build /tmp/python ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler (file.function)
CMD ["main.handler"]
  