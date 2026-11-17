#!/bin/sh
set -eu

target=/tmp/restore
port=5433

pgbackrest verify
pgbackrest info
mkdir -m 700 "$target"
pgbackrest restore --pg1-path="$target" --archive-mode=off
pg_ctl -D "$target" -o "-c port=$port -c listen_addresses='' -c unix_socket_directories=/tmp" -w -t 900 start
trap 'pg_ctl -D "$target" -m fast stop' EXIT

until [ "$(psql -h /tmp -p "$port" -U postgres -d postgres -Atc 'select pg_is_in_recovery()')" = f ]; do
  sleep 1
done

psql -h /tmp -p "$port" -U postgres -d kids_chores -Atc \
  "select 'families: ' || count(*) from core.families; select 'last change: ' || coalesce(max(updated_at)::text, 'none') from core.records"
