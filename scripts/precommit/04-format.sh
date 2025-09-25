#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

echo "④ $COMPOSE_CMD exec -T app pnpm format"
$COMPOSE_CMD exec -T app pnpm format
