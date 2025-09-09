# syntax=docker/dockerfile:1

# Use the AWS Lambda Python base image for the runtime you need
FROM public.ecr.aws/lambda/python:3.11

# Copy function code
COPY main.py ${LAMBDA_TASK_ROOT}/

# If you have dependencies, copy requirements.txt and install
# (left here for future use; this layer is empty if file missing)
COPY requirements.txt ./
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt -t "${LAMBDA_TASK_ROOT}"; fi

# Set the CMD to your handler (file.function)
CMD ["main.handler"]


