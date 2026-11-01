#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"
COMPOSE_OVERRIDE="compose.prod.yaml"
previous_commit=""
backup_file=""
deployment_started=0

log() {
    printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" >&2
}

rollback() {
    local exit_code=$?
    trap - ERR
    if [[ "$deployment_started" == "1" && -n "$previous_commit" ]]; then
        log "Deployment failed; restoring application code to $previous_commit."
        git -c advice.detachedHead=false switch --detach "$previous_commit" || true
        git branch --force "$DEPLOY_BRANCH" "$previous_commit" || true
        git switch "$DEPLOY_BRANCH" || true
        "${compose[@]}" up -d --build --wait || true

        if [[ "${ROLLBACK_DATABASE_ON_FAILURE:-0}" == "1" && -n "$backup_file" ]]; then
            log "ROLLBACK_DATABASE_ON_FAILURE=1; restoring the pre-deploy database backup."
            ENV_FILE="$ENV_FILE" COMPOSE_OVERRIDE="$COMPOSE_OVERRIDE" SKIP_PRE_RESTORE_BACKUP=1 \
                "$SCRIPT_DIR/restore.sh" "$backup_file" --confirm || true
        elif [[ -n "$backup_file" ]]; then
            log "Database was not changed automatically. Manual restore, if needed: ENV_FILE='$ENV_FILE' '$SCRIPT_DIR/restore.sh' '$backup_file' --confirm"
        fi
    fi
    exit "$exit_code"
}
trap rollback ERR

for command_name in docker git curl gzip; do
    command -v "$command_name" >/dev/null 2>&1 || { log "Required command is missing: $command_name"; exit 2; }
done

DEPLOY_LOCK_DIR="${DEPLOY_LOCK_DIR:-${TMPDIR:-/tmp}/avtozakup-deploy.lock}"
if ! mkdir "$DEPLOY_LOCK_DIR" 2>/dev/null; then
    log "Another deployment appears to be running (lock: $DEPLOY_LOCK_DIR)."
    exit 1
fi
cleanup_lock() {
    rmdir "$DEPLOY_LOCK_DIR" 2>/dev/null || true
}
trap cleanup_lock EXIT

[[ -f "$ENV_FILE" ]] || { log "Environment file not found: $ENV_FILE"; exit 2; }
if grep -Eq 'change-me|REPLACE_WITH|YOUR\.TRUSTED|SERVER_IP' "$ENV_FILE"; then
    log "The production environment file still contains placeholder values."
    exit 2
fi

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

DEPLOY_BRANCH="${DEPLOY_BRANCH:-$(read_env_value DEPLOY_BRANCH)}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
ROLLBACK_DATABASE_ON_FAILURE="${ROLLBACK_DATABASE_ON_FAILURE:-$(read_env_value ROLLBACK_DATABASE_ON_FAILURE)}"
ROLLBACK_DATABASE_ON_FAILURE="${ROLLBACK_DATABASE_ON_FAILURE:-0}"
cd "$PROJECT_ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
    log "Local changes are present. Commit, remove, or stash them before deployment."
    exit 1
fi

current_branch="$(git symbolic-ref --quiet --short HEAD || true)"
if [[ "$current_branch" != "$DEPLOY_BRANCH" ]]; then
    log "Expected branch '$DEPLOY_BRANCH', found '${current_branch:-detached HEAD}'."
    exit 1
fi

compose=(docker compose --env-file "$ENV_FILE" -f compose.yaml -f "$COMPOSE_OVERRIDE")
"${compose[@]}" config --quiet
previous_commit="$(git rev-parse HEAD)"

if [[ -n "$("${compose[@]}" ps --status running -q db 2>/dev/null || true)" ]]; then
    log "Creating pre-deploy database backup."
    backup_file="$(ENV_FILE="$ENV_FILE" COMPOSE_OVERRIDE="$COMPOSE_OVERRIDE" "$SCRIPT_DIR/backup.sh")"
else
    log "Database is not running yet; treating this as an initial deployment."
fi

log "Fetching and fast-forwarding origin/$DEPLOY_BRANCH."
git fetch --prune origin "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"
deployment_started=1

"${compose[@]}" config --quiet
log "Building and starting the isolated avtozakup stack without removing volumes."
"${compose[@]}" up -d --build --wait

log "Running idempotent WordPress bootstrap."
"${compose[@]}" run --rm --entrypoint sh wpcli /workspace/scripts/bootstrap-wordpress.sh

log "Running smoke tests."
ENV_FILE="$ENV_FILE" "$SCRIPT_DIR/smoke.sh"

deployment_started=0
trap - ERR
log "Deployment completed successfully at commit $(git rev-parse HEAD)."
if [[ -n "$backup_file" ]]; then
    log "Pre-deploy backup: $backup_file"
fi
