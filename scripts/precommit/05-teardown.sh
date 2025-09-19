#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"
STATE_FILE="${STATE_FILE:-.git/.compose-started-services}"

echo "⑤ then down docker if not started previously"
if [[ -s "$STATE_FILE" ]]; then
  mapfile -t STARTED < "$STATE_FILE"
  echo "   → stopping services we started: ${STARTED[*]}"
  $COMPOSE_CMD stop "${STARTED[@]}" || true
  $COMPOSE_CMD rm -f "${STARTED[@]}" >/dev/null 2>&1 || true
else
  echo "   → nothing to stop; services were already running."
fi

# Clean up the state file
: > "$STATE_FILE"
