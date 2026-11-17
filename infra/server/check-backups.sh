#!/bin/sh
set -eu

cd "$(dirname "$0")"
docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest check
docker compose -f compose.prod.yaml exec -T --user postgres postgres pgbackrest info --output=json | python3 -c '
import json, sys, time
backups = json.load(sys.stdin)[0]["backup"]
age = time.time() - backups[-1]["timestamp"]["stop"] if backups else None
if age is None or age > 36 * 3600:
    sys.exit("the last full backup is missing or older than 36 hours")
print(f"last full backup: {age / 3600:.1f} hours ago")
'
docker compose -f compose.prod.yaml run --rm -T restore-check
