#!/bin/sh
set -eu

cd "$(dirname "$0")"

docker login ghcr.io --username github-actions --password-stdin
docker compose -f compose.prod.yaml pull --quiet
docker logout ghcr.io
docker compose -f compose.prod.yaml up --detach --remove-orphans
docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest stanza-create
docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest check
if docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest info --output=json | grep -q '"backup":\[\]'; then
  ./backup.sh
fi
crontab crontab
docker image prune --force
