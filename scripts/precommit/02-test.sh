#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

echo "② $COMPOSE_CMD exec -T app pnpm test"
$COMPOSE_CMD exec -T app pnpm test
