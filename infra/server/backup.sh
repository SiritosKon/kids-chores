#!/bin/sh
set -eu

cd "$(dirname "$0")"
docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest backup --type=full
