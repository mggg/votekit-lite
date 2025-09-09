from __future__ import annotations

import json
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, PlainTextResponse

from main import handler as lambda_handler

app = FastAPI(title="votekit lambda dev server")


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


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_all(path: str, request: Request) -> Response:
    """Map arbitrary HTTP requests to a Lambda proxy-style event."""
    raw_body = await request.body()
    body_text = raw_body.decode("utf-8") if raw_body else None
    event = _build_event_from_request(path, request, body_text)
    result = lambda_handler(event, context=None)

    status = int(result.get("statusCode", 200))
    headers = result.get("headers") or {}
    body = result.get("body")

    if isinstance(body, (dict, list)):
        return JSONResponse(content=body, status_code=status, headers=headers)
    if isinstance(body, str):
        ct = (headers.get("Content-Type") or headers.get("content-type") or "").lower()
        if "json" in ct:
            try:
                parsed = json.loads(body)
                return JSONResponse(content=parsed, status_code=status, headers=headers)
            except json.JSONDecodeError:
                pass
        return PlainTextResponse(content=body, status_code=status, headers=headers)
    return PlainTextResponse(content=str(body), status_code=status, headers=headers)


@app.get("/")
async def root() -> Dict[str, Any]:
    return {"message": "votekit lambda dev server running"}
