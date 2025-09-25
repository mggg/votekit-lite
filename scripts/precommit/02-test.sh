#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

echo "$COMPOSE_CMD exec -T app pnpm test"
$COMPOSE_CMD exec -T app pnpm test

echo "$COMPOSE_CMD exec -T lambda python main.py -v"
$COMPOSE_CMD exec -T lambda python main.py -v