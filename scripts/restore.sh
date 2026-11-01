#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
    echo "Usage: $0 /absolute/path/to/backup.sql.gz --confirm" >&2
}

if [[ $# -ne 2 || "$2" != "--confirm" ]]; then
    usage
    echo "Restore is destructive and requires the explicit --confirm flag." >&2
    exit 2
fi

BACKUP_FILE="$1"
UPLOADS_BACKUP="${BACKUP_FILE%.sql.gz}.uploads.tar.gz"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"
COMPOSE_OVERRIDE="${COMPOSE_OVERRIDE:-compose.prod.yaml}"

[[ -f "$BACKUP_FILE" ]] || { echo "Backup not found: $BACKUP_FILE" >&2; exit 2; }
[[ -f "$ENV_FILE" ]] || { echo "Environment file not found: $ENV_FILE" >&2; exit 2; }
gzip -t "$BACKUP_FILE"

if [[ ! -f "$UPLOADS_BACKUP" && "${ALLOW_DB_ONLY_RESTORE:-0}" != "1" ]]; then
    echo "Matching uploads backup not found: $UPLOADS_BACKUP" >&2
    echo "Set ALLOW_DB_ONLY_RESTORE=1 only for an explicitly approved database-only recovery." >&2
    exit 2
fi

if [[ -f "$UPLOADS_BACKUP" ]]; then
    command -v tar >/dev/null 2>&1 || { echo "tar is required." >&2; exit 2; }
    gzip -t "$UPLOADS_BACKUP"
    if tar -tzf "$UPLOADS_BACKUP" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
        echo "Unsafe path found in uploads backup: $UPLOADS_BACKUP" >&2
        exit 2
    fi
fi

cd "$PROJECT_ROOT"
compose=(docker compose --env-file "$ENV_FILE" -f compose.yaml -f "$COMPOSE_OVERRIDE")
"${compose[@]}" config --quiet

if [[ -z "$("${compose[@]}" ps --status running -q db)" ]]; then
    echo "The database service must be running before restore." >&2
    exit 1
fi

if [[ "${SKIP_PRE_RESTORE_BACKUP:-0}" != "1" ]]; then
    echo "Creating a pre-restore safety backup..." >&2
    ENV_FILE="$ENV_FILE" COMPOSE_OVERRIDE="$COMPOSE_OVERRIDE" "$SCRIPT_DIR/backup.sh" >&2
fi

wordpress_was_running=0
if [[ -n "$("${compose[@]}" ps --status running -q wordpress)" ]]; then
    wordpress_was_running=1
    "${compose[@]}" stop wordpress
fi

restart_wordpress() {
    if [[ "$wordpress_was_running" == "1" ]]; then
        "${compose[@]}" up -d --wait wordpress
    fi
}
trap restart_wordpress EXIT

"${compose[@]}" exec -T db sh -eu -c '
    case "$MARIADB_DATABASE" in
        ""|*[!A-Za-z0-9_]*) echo "Unsafe database name." >&2; exit 2 ;;
    esac
    mariadb --user=root --password="$MARIADB_ROOT_PASSWORD" --execute="DROP DATABASE IF EXISTS \`$MARIADB_DATABASE\`; CREATE DATABASE \`$MARIADB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
'

gzip -dc "$BACKUP_FILE" | "${compose[@]}" exec -T db sh -eu -c '
    exec mariadb --user=root --password="$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"
'

if [[ -f "$UPLOADS_BACKUP" ]]; then
    echo "Restoring WordPress uploads..." >&2
    gzip -dc "$UPLOADS_BACKUP" | "${compose[@]}" run --rm -T --no-deps --user 0:0 --entrypoint sh wordpress -eu -c '
        uploads=/var/www/html/wp-content/uploads
        test -d "$uploads"
        find "$uploads" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
        tar -xf - -C "$uploads"
        chown -R 33:33 "$uploads"
    '
fi

restart_wordpress
wordpress_was_running=0
trap - EXIT
echo "Database and uploads restore completed successfully from: $BACKUP_FILE"
