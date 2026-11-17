#!/usr/bin/env bash
set -euo pipefail

required=(
  REGISTRY IMAGE_TAG DOMAIN
  POSTGRES_PASSWORD MIGRATOR_PASSWORD APP_CORE_PASSWORD APP_NOTIFICATIONS_PASSWORD VALKEY_PASSWORD
  AUTH_PEPPER SMTP_URL MAIL_FROM
  S3_HOST S3_REGION S3_BUCKET S3_ACCESS_KEY S3_SECRET_KEY BACKUP_BUCKET BACKUP_CIPHER_PASS
)
optional=(
  AUTH_PROVIDERS GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET TELEGRAM_CLIENT_ID TELEGRAM_CLIENT_SECRET
  EMAIL_SIGN_IN PWNED_PASSWORDS_URL MIN_CLIENT_VERSION
)

missing=()
for name in "${required[@]}"; do
  [[ -n "${!name:-}" ]] || missing+=("$name")
done
if ((${#missing[@]} > 0)); then
  echo "missing settings: ${missing[*]}" >&2
  exit 1
fi

for name in "${required[@]}" "${optional[@]}"; do
  value=${!name:-}
  if [[ -z "$value" ]]; then
    continue
  fi
  if [[ "$value" == *"'"* || "$value" == *$'\n'* ]]; then
    echo "$name has a quote or a line break" >&2
    exit 1
  fi
  printf "%s='%s'\n" "$name" "$value"
done
