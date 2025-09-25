#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

echo "③ $COMPOSE_CMD exec -T app pnpm check"
$COMPOSE_CMD exec -T app pnpm check
