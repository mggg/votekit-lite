"""
AWS Lambda containerized entrypoint.

This module exposes a `handler` function compatible with AWS Lambda. It is
kept intentionally minimal so it can be extended later. The container image
will be built and pushed to ECR, and the Lambda will reference that image.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict
from common_schema import validation_schema
from jsonschema import validate


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Basic Lambda handler.

    - Echoes the incoming event
    - Includes environment metadata helpful for diagnostics
    """
    try:
        validate(event, validation_schema)
    except jsonschema.exceptions.ValidationError as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "Invalid event", "errors": str(e)}),
        }
        
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(
            {
                "message": "votekit lambda alive",
                "event": event,
                "env": {
                    "AWS_REGION": os.getenv("AWS_REGION"),
                    "AWS_EXECUTION_ENV": os.getenv("AWS_EXECUTION_ENV"),
                },
            }
        ),
    }


if __name__ == "__main__":
    # Simple local test harness
    print(
        json.dumps(
            handler({"local": True, "ping": "pong"}, context=None),
            indent=2,
        )
    )


