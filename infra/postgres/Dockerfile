FROM docker.io/library/postgres:17-bookworm
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates pgbackrest \
  && rm -rf /var/lib/apt/lists/*
COPY infra/postgres/init.sh /docker-entrypoint-initdb.d/init.sh
COPY infra/postgres/restore-check.sh /usr/local/bin/restore-check
