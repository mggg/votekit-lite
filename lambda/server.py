from __future__ import annotations

import json
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from main import handler as lambda_handler

app = FastAPI(title="votekit lambda dev server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_event_from_request(path: str, request: Request, body_text: Optional[str]) -> Dict[str, Any]:
    # Minimal API Gateway v1-style event
    return {
        "resource": f"/{path}",
        "path": f"/{path}",
        "httpMethod": request.method,
        "headers": {k: v for k, v in request.headers.items()},
        "queryStringParameters": dict(request.query_params) if request.query_params else None,
        "pathParameters": None,
        "stageVariables": None,
        "requestContext": {
            "resourcePath": f"/{path}",
            "httpMethod": request.method,
            "path": f"/{path}",
        },
        "body": body_text,
        "isBase64Encoded": False,
    }


@app.post("/invoke")
async def invoke(event: Dict[str, Any]) -> Response:
    """Directly invoke the Lambda handler with a provided event JSON."""
    result = lambda_handler(event, context=None)
    status = int(result.get("statusCode", 200))
    headers = result.get("headers") or {}
    body = result.get("body")

    # Try to interpret body as JSON when appropriate
    if isinstance(body, (dict, list)):
        return JSONResponse(content=body, status_code=status, headers=headers)
    if isinstance(body, str):
        try:
            parsed = json.loads(body)
            return JSONResponse(content=parsed, status_code=status, headers=headers)
        except json.JSONDecodeError:
            return PlainTextResponse(content=body, status_code=status, headers=headers)
    return PlainTextResponse(content=str(body), status_code=status, headers=headers)

@app.get("/")
async def root() -> Dict[str, Any]:
    return {"message": "votekit lambda dev server running"}
