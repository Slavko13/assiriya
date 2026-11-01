#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"
COMPOSE_OVERRIDE="${COMPOSE_OVERRIDE:-compose.prod.yaml}"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "Environment file not found: $ENV_FILE" >&2
    exit 2
fi

command -v docker >/dev/null 2>&1 || { echo "Docker CLI is required." >&2; exit 2; }
command -v gzip >/dev/null 2>&1 || { echo "gzip is required." >&2; exit 2; }
command -v tar >/dev/null 2>&1 || { echo "tar is required." >&2; exit 2; }

read_env_value() {
    local key="$1"
    local line
    line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
    line="${line#*=}"
    line="${line%$'\r'}"
    line="${line%\"}"
    line="${line#\"}"
    printf '%s' "$line"
}

BACKUP_DIR="${BACKUP_DIR:-$(read_env_value BACKUP_DIR)}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-$(read_env_value BACKUP_RETENTION_DAYS)}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

cd "$PROJECT_ROOT"
compose=(docker compose --env-file "$ENV_FILE" -f compose.yaml -f "$COMPOSE_OVERRIDE")
"${compose[@]}" config --quiet

if [[ -z "$("${compose[@]}" ps --status running -q db)" ]]; then
    echo "The database service is not running; no backup was created." >&2
    exit 1
fi

umask 077
mkdir -p "$BACKUP_DIR"
resolved_backup_dir="$(cd -- "$BACKUP_DIR" && pwd -P)"
case "$resolved_backup_dir" in
    /|/opt|/var|/var/lib|/var/backups)
        echo "Refusing to use an unsafe broad backup directory: $resolved_backup_dir" >&2
        exit 2
        ;;
esac
timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
target="$resolved_backup_dir/avtozakup-${timestamp}.sql.gz"
uploads_target="$resolved_backup_dir/avtozakup-${timestamp}.uploads.tar.gz"
temporary="${target}.tmp"
uploads_temporary="${uploads_target}.tmp"
trap 'rm -f -- "$temporary" "$uploads_temporary"' EXIT

echo "Creating database backup..." >&2
"${compose[@]}" exec -T db sh -eu -c '
    exec mariadb-dump \
        --user=root \
        --password="$MARIADB_ROOT_PASSWORD" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        --events \
        --hex-blob \
        --default-character-set=utf8mb4 \
        "$MARIADB_DATABASE"
' | gzip -9 >"$temporary"

gzip -t "$temporary"

echo "Creating uploads backup..." >&2
"${compose[@]}" run --rm -T --no-deps --user 0:0 --entrypoint sh wordpress -eu -c '
    uploads=/var/www/html/wp-content/uploads
    test -d "$uploads"
    exec tar -C "$uploads" -czf - .
' >"$uploads_temporary"

gzip -t "$uploads_temporary"
tar -tzf "$uploads_temporary" >/dev/null

mv -- "$uploads_temporary" "$uploads_target"
mv -- "$temporary" "$target"
trap - EXIT

retention_days="$BACKUP_RETENTION_DAYS"
if [[ "$retention_days" =~ ^[0-9]+$ ]]; then
    find "$resolved_backup_dir" -maxdepth 1 -type f -name 'avtozakup-*.sql.gz' -mtime "+$retention_days" -delete
    find "$resolved_backup_dir" -maxdepth 1 -type f -name 'avtozakup-*.uploads.tar.gz' -mtime "+$retention_days" -delete
fi

printf 'Uploads: %s\n' "$uploads_target" >&2
printf '%s\n' "$target"
