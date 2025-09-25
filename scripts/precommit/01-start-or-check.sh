#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"   # set to "docker-compose" if on v1
SERVICES=(app lambda)
STATE_FILE="${STATE_FILE:-.git/.compose-started-services}"

mkdir -p .git
: > "$STATE_FILE"  # clear state file at the start

support_wait() { $COMPOSE_CMD up --help 2>/dev/null | grep -q -- "--wait"; }

running_services() {
  if $COMPOSE_CMD ps --help 2>/dev/null | grep -q -- "--services"; then
    $COMPOSE_CMD ps --services --filter status=running 2>/dev/null || true
  else
    local out=""
    for s in "${SERVICES[@]}"; do
      if [[ -n "$($COMPOSE_CMD ps -q "$s" 2>/dev/null)" ]]; then
        out+="$s"$'\n'
      fi
    done
    printf "%s" "$out"
  fi
}

echo "① start or check docker"
RUNNING="$(running_services)"
NEED_START=()
for s in "${SERVICES[@]}"; do
  if ! grep -qx "$s" <<<"$RUNNING"; then
    NEED_START+=("$s")
  fi
done

if (( ${#NEED_START[@]} > 0 )); then
  echo "   → starting: ${NEED_START[*]}"
  $COMPOSE_CMD up -d "${NEED_START[@]}"
  if support_wait; then
    $COMPOSE_CMD up -d --wait "${NEED_START[@]}"
  else
    echo "   → '--wait' not supported; sleeping briefly…"
    sleep 5
  fi
  printf "%s\n" "${NEED_START[@]}" > "$STATE_FILE"   # record what we started
else
  echo "   → all required services already running: ${SERVICES[*]}"
  : > "$STATE_FILE"  # empty means we didn't start anything
fi
