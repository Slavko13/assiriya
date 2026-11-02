#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.quick}"
COMPOSE_PROJECT="avtozakup"
COMPOSE_OVERRIDE="compose.quick-tunnel.yaml"
MIN_FREE_KB="${MIN_FREE_KB:-2097152}"
STATE_DIR=""
LOCK_ACQUIRED=0
MUTATION_STARTED=0
PREVIOUS_PUBLIC_URL=""

log() {
    printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" >&2
}

recovery_hint() {
    if [[ "$MUTATION_STARTED" == "1" ]]; then
        log "The avtozakup preview changed before this failure. Re-run the same installer command to reconcile the Quick Tunnel URL and project containers; named data volumes were not deleted."
        if [[ -n "$PREVIOUS_PUBLIC_URL" ]]; then
            log "The previous preview URL was $PREVIOUS_PUBLIC_URL and may no longer work after connector replacement."
        fi
    fi
}

fail() {
    log "ERROR: $*"
    recovery_hint
    exit 1
}

cleanup() {
    if [[ -n "$STATE_DIR" && -d "$STATE_DIR" && "$(basename -- "$STATE_DIR")" == avtozakup-quick-tunnel.* ]]; then
        rm -f -- \
            "$STATE_DIR/foreign.before" \
            "$STATE_DIR/containers.before.ids" \
            "$STATE_DIR/listeners.before" \
            "$STATE_DIR/listeners.after" \
            "$STATE_DIR/smoke.log"
        rmdir -- "$STATE_DIR" 2>/dev/null || true
    fi
    if [[ "$LOCK_ACQUIRED" == "1" ]]; then
        rmdir -- "$DEPLOY_LOCK_DIR" 2>/dev/null || true
    fi
}
trap cleanup EXIT

on_error() {
    local exit_code=$?
    trap - ERR
    recovery_hint
    exit "$exit_code"
}
trap on_error ERR

for command_name in docker git curl openssl gzip tar grep awk sort cmp mktemp df sed; do
    command -v "$command_name" >/dev/null 2>&1 || fail "Required command is missing: $command_name"
done
[[ "$MIN_FREE_KB" =~ ^[0-9]+$ ]] || fail "MIN_FREE_KB must be a non-negative integer."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required."
docker info >/dev/null 2>&1 || fail "The Docker daemon is not available to the current user."

read -r -a EXISTING_URLS <<< "${EXISTING_SITE_URLS:-}"
if [[ "${#EXISTING_URLS[@]}" -ne 2 ]]; then
    fail "EXISTING_SITE_URLS must contain exactly two space-separated public site URLs."
fi
if [[ "${EXISTING_URLS[0]}" == "${EXISTING_URLS[1]}" ]]; then
    fail "EXISTING_SITE_URLS must contain two different site URLs."
fi
for existing_url in "${EXISTING_URLS[@]}"; do
    [[ "$existing_url" =~ ^https?://[^[:space:]]+$ ]] || fail "Invalid existing site URL: $existing_url"
done

[[ -n "${EXPECTED_SERVER_IP:-}" ]] || fail "EXPECTED_SERVER_IP is required."
[[ "$EXPECTED_SERVER_IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || fail "EXPECTED_SERVER_IP must be an IPv4 address."
public_trace="$(curl -4 --fail --silent --show-error --max-time 15 https://1.1.1.1/cdn-cgi/trace)" || fail "Could not determine the server public IPv4 through Cloudflare."
detected_public_ip="$(awk -F= '$1 == "ip" { print $2; exit }' <<< "$public_trace")"
[[ "$detected_public_ip" == "$EXPECTED_SERVER_IP" ]] || fail "Expected server $EXPECTED_SERVER_IP, but outbound IPv4 is ${detected_public_ip:-unknown}."

cd "$PROJECT_ROOT"
[[ "$(git symbolic-ref --quiet --short HEAD || true)" == "main" ]] || fail "The deployment checkout must be on branch main."
[[ -z "$(git status --porcelain)" ]] || fail "The deployment checkout contains local changes."

DEPLOY_LOCK_DIR="${DEPLOY_LOCK_DIR:-${TMPDIR:-/tmp}/avtozakup-quick-tunnel.lock}"
if ! mkdir -- "$DEPLOY_LOCK_DIR" 2>/dev/null; then
    fail "Another Quick Tunnel deployment appears to be running (lock: $DEPLOY_LOCK_DIR)."
fi
LOCK_ACQUIRED=1

STATE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/avtozakup-quick-tunnel.XXXXXX")"

probe_site() {
    local requested_url="$1"
    local result code effective origin
    result="$(curl --fail --silent --show-error --location --max-time 25 --connect-timeout 7 \
        --output /dev/null --write-out '%{http_code}|%{url_effective}' "$requested_url")" || return 1
    IFS='|' read -r code effective <<< "$result"
    [[ "$code" =~ ^[23][0-9][0-9]$ ]] || return 1
    [[ "$effective" =~ ^(https?://[^/]+) ]] || return 1
    origin="${BASH_REMATCH[1]}"
    printf '%s|%s|%s\n' "$code" "$effective" "$origin"
}

before_origins=()
log "Checking both existing sites before changing the avtozakup project."
for existing_url in "${EXISTING_URLS[@]}"; do
    probe_result="$(probe_site "$existing_url")" || fail "Existing site is not healthy before deployment: $existing_url"
    IFS='|' read -r probe_code probe_effective probe_origin <<< "$probe_result"
    before_origins+=("$probe_origin")
    log "Existing site OK: $existing_url -> $probe_code $probe_effective"
done

snapshot_foreign_containers() {
    local output_file="$1"
    local id project name state health restart_count
    : > "$output_file"
    while IFS= read -r id; do
        [[ -n "$id" ]] || continue
        project="$(docker inspect --format '{{if .Config.Labels}}{{index .Config.Labels "com.docker.compose.project"}}{{end}}' "$id")"
        [[ "$project" == "$COMPOSE_PROJECT" ]] && continue
        name="$(docker inspect --format '{{.Name}}' "$id")"
        name="${name#/}"
        state="$(docker inspect --format '{{.State.Status}}' "$id")"
        health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$id")"
        restart_count="$(docker inspect --format '{{.RestartCount}}' "$id")"
        printf '%s|%s|%s|%s|%s\n' "$id" "$name" "$state" "$health" "$restart_count" >> "$output_file"
    done < "$STATE_DIR/containers.before.ids"
    sort -o "$output_file" "$output_file"
}

docker ps -aq --no-trunc > "$STATE_DIR/containers.before.ids" || fail "Could not capture the pre-deployment container inventory."
snapshot_foreign_containers "$STATE_DIR/foreign.before"
log "Read-only Docker inventory (no containers below will be removed or restarted):"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' >&2

if command -v ss >/dev/null 2>&1; then
    ss -H -ltnp | awk '$4 ~ /:80$/ || $4 ~ /:443$/' | sort > "$STATE_DIR/listeners.before"
    log "Current listeners on ports 80/443:"
    if [[ -s "$STATE_DIR/listeners.before" ]]; then
        sed 's/^/  /' "$STATE_DIR/listeners.before" >&2
    else
        log "No listeners reported on 80/443."
    fi
else
    : > "$STATE_DIR/listeners.before"
    log "The optional ss utility is absent; URL and container guards remain active."
fi
if command -v systemctl >/dev/null 2>&1; then
    log "Host Caddy state: $(systemctl is-active caddy 2>/dev/null || true)"
fi

project_resources_exist=0
while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    container_project="$(docker inspect --format '{{if .Config.Labels}}{{index .Config.Labels "com.docker.compose.project"}}{{end}}' "$id")"
    [[ "$container_project" == "$COMPOSE_PROJECT" ]] || continue
    project_resources_exist=1
    working_dir="$(docker inspect --format '{{if .Config.Labels}}{{index .Config.Labels "com.docker.compose.project.working_dir"}}{{end}}' "$id")"
    [[ "$working_dir" == "$PROJECT_ROOT" ]] || fail "Container $id uses project '$COMPOSE_PROJECT' from another checkout: ${working_dir:-unknown}"
done < "$STATE_DIR/containers.before.ids"

for network_name in avtozakup_edge avtozakup_database; do
    if docker network inspect "$network_name" >/dev/null 2>&1; then
        project_resources_exist=1
        resource_project="$(docker network inspect --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' "$network_name")"
        [[ "$resource_project" == "$COMPOSE_PROJECT" ]] || fail "Network name collision: $network_name is not owned by Compose project $COMPOSE_PROJECT."
    fi
done
for volume_name in avtozakup_db_data avtozakup_wordpress_data avtozakup_uploads_data avtozakup_caddy_data avtozakup_caddy_config; do
    if docker volume inspect "$volume_name" >/dev/null 2>&1; then
        project_resources_exist=1
        resource_project="$(docker volume inspect --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' "$volume_name")"
        [[ "$resource_project" == "$COMPOSE_PROJECT" ]] || fail "Volume name collision: $volume_name is not owned by Compose project $COMPOSE_PROJECT."
    fi
done

if [[ "$project_resources_exist" == "1" && ! -f "$ENV_FILE" ]]; then
    fail "Existing avtozakup resources were found, but $ENV_FILE is missing. Restore the original environment file instead of generating new database secrets."
fi

free_kb="$(df -Pk "$PROJECT_ROOT" | awk 'NR == 2 { print $4 }')"
[[ "$free_kb" =~ ^[0-9]+$ ]] || fail "Could not determine free disk space."
(( free_kb >= MIN_FREE_KB )) || fail "At least $MIN_FREE_KB KiB free disk space is required; found $free_kb KiB."

if [[ ! -f "$ENV_FILE" ]]; then
    log "Generating a mode-600 Quick Tunnel environment file; secrets will not be printed."
    umask 077
    db_password="$(openssl rand -hex 32)"
    db_root_password="$(openssl rand -hex 32)"
    admin_password="$(openssl rand -hex 36)"
    cat > "$ENV_FILE" <<EOF
COMPOSE_PROJECT_NAME=avtozakup
PUBLIC_URL=http://caddy:8080
MARIADB_DATABASE=avtozakup
MARIADB_USER=avtozakup
MARIADB_PASSWORD=$db_password
MARIADB_ROOT_PASSWORD=$db_root_password
WORDPRESS_TABLE_PREFIX=wp_
WP_ADMIN_USER=avtozakup_admin
WP_ADMIN_PASSWORD=$admin_password
WP_ADMIN_EMAIL=${WP_ADMIN_EMAIL:-admin@example.invalid}
WP_SITE_TITLE=АВТОЗАКУП
WP_LOCALE=ru_RU
WP_TIMEZONE=Europe/Moscow
WP_ENVIRONMENT_TYPE=production
WORDPRESS_DEBUG=0
WP_THEME=avtozakup
WP_PLUGIN=avtozakup-core
WOOCOMMERCE_VERSION=11.2.1
BACKUP_DIR=$PROJECT_ROOT/backups
BACKUP_RETENTION_DAYS=14
EOF
    unset db_password db_root_password admin_password
fi
chmod 600 "$ENV_FILE"
grep -Eq '^PUBLIC_URL=' "$ENV_FILE" || fail "PUBLIC_URL is missing from $ENV_FILE."

compose=(docker compose --project-name "$COMPOSE_PROJECT" --env-file "$ENV_FILE" -f compose.yaml -f "$COMPOSE_OVERRIDE")
compose_tools=(docker compose --project-name "$COMPOSE_PROJECT" --env-file "$ENV_FILE" -f compose.yaml -f "$COMPOSE_OVERRIDE" --profile tools)
"${compose[@]}" config --quiet
if "${compose[@]}" config | grep -E '^[[:space:]]+ports:$' >/dev/null; then
    fail "Quick Tunnel Compose unexpectedly publishes a host port."
fi

PREVIOUS_PUBLIC_URL="$(grep -E '^PUBLIC_URL=' "$ENV_FILE" | tail -n 1)"
PREVIOUS_PUBLIC_URL="${PREVIOUS_PUBLIC_URL#*=}"
log "Building the project-owned WordPress image before any running preview container is replaced."
"${compose[@]}" build wordpress
if docker volume inspect avtozakup_db_data >/dev/null 2>&1; then
    log "Existing database volume found; starting only its project DB and creating a paired database/uploads backup."
    "${compose[@]}" up -d --wait --wait-timeout 180 db
    ENV_FILE="$ENV_FILE" COMPOSE_OVERRIDE="$COMPOSE_OVERRIDE" "$SCRIPT_DIR/backup.sh" >/dev/null
else
    log "No project database volume exists; this is an initial deployment."
fi

log "Starting a fresh outbound-only Cloudflare Quick Tunnel."
MUTATION_STARTED=1
"${compose[@]}" up -d --no-deps --force-recreate cloudflared

tunnel_url=""
deadline=$((SECONDS + 120))
while (( SECONDS < deadline )); do
    tunnel_url="$("${compose[@]}" logs --no-color --tail 250 cloudflared 2>&1 \
        | grep -Eo 'https://[-a-z0-9]+\.trycloudflare\.com' \
        | tail -n 1 || true)"
    [[ -n "$tunnel_url" ]] && break
    sleep 2
done
[[ -n "$tunnel_url" ]] || {
    "${compose[@]}" logs --no-color --tail 80 cloudflared >&2 || true
    fail "Cloudflare did not issue a Quick Tunnel URL within 120 seconds."
}
log "Cloudflare issued the temporary preview URL."

update_public_url() {
    local new_url="$1"
    local temporary_env found line
    temporary_env="$(mktemp "${ENV_FILE}.tmp.XXXXXX")"
    found=0
    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ "$line" == PUBLIC_URL=* ]]; then
            printf 'PUBLIC_URL=%s\n' "$new_url" >> "$temporary_env"
            found=1
        else
            printf '%s\n' "$line" >> "$temporary_env"
        fi
    done < "$ENV_FILE"
    if [[ "$found" != "1" ]]; then
        printf 'PUBLIC_URL=%s\n' "$new_url" >> "$temporary_env"
    fi
    chmod 600 "$temporary_env"
    mv -- "$temporary_env" "$ENV_FILE"
}
update_public_url "$tunnel_url"
"${compose[@]}" config --quiet

wait_healthy() {
    local service="$1"
    local timeout_seconds="$2"
    local service_id health end_time
    end_time=$((SECONDS + timeout_seconds))
    while (( SECONDS < end_time )); do
        service_id="$("${compose[@]}" ps -q "$service" 2>/dev/null || true)"
        if [[ -n "$service_id" ]]; then
            health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$service_id")"
            [[ "$health" == "healthy" || "$health" == "running" ]] && return 0
            [[ "$health" == "unhealthy" || "$health" == "exited" || "$health" == "dead" ]] && return 1
        fi
        sleep 3
    done
    return 1
}

log "Starting the isolated database."
"${compose[@]}" up -d db
wait_healthy db 180 || fail "The project database did not become healthy."
log "Recreating only the project WordPress container with the new public URL."
"${compose[@]}" up -d --no-deps --force-recreate wordpress
wait_healthy wordpress 300 || fail "WordPress did not become healthy."
log "Recreating only the project Caddy container; it has no published host ports."
"${compose[@]}" up -d --no-deps --force-recreate caddy
wait_healthy caddy 180 || fail "The project Caddy did not become healthy."

log "Running the idempotent WordPress bootstrap."
"${compose_tools[@]}" run --rm --no-deps --entrypoint sh wpcli /workspace/scripts/bootstrap-wordpress.sh

log "Waiting for the public Quick Tunnel smoke tests."
smoke_ok=0
for ((attempt = 1; attempt <= 30; attempt++)); do
    if ENV_FILE="$ENV_FILE" SMOKE_URL="$tunnel_url" "$SCRIPT_DIR/smoke.sh" > "$STATE_DIR/smoke.log" 2>&1; then
        smoke_ok=1
        break
    fi
    sleep 4
done
if [[ "$smoke_ok" != "1" ]]; then
    cat "$STATE_DIR/smoke.log" >&2 || true
    fail "The public Quick Tunnel did not pass smoke tests."
fi
cat "$STATE_DIR/smoke.log" >&2

for blocked_path in /wp-admin/ /wp-login.php /wp-login.php/; do
    admin_status="$(curl --silent --show-error --max-time 20 --output /dev/null --write-out '%{http_code}' "$tunnel_url$blocked_path")"
    [[ "$admin_status" == "403" ]] || fail "Public $blocked_path must return 403; received $admin_status."
done
log "Public administrator routes and login PATH_INFO variants are blocked with HTTP 403."

log "Rechecking both existing sites."
for index in "${!EXISTING_URLS[@]}"; do
    existing_url="${EXISTING_URLS[$index]}"
    probe_result="$(probe_site "$existing_url")" || fail "Existing site is not healthy after deployment: $existing_url"
    IFS='|' read -r probe_code probe_effective probe_origin <<< "$probe_result"
    [[ "$probe_origin" == "${before_origins[$index]}" ]] || fail "Existing site redirect origin changed: $existing_url -> $probe_origin"
    log "Existing site still OK: $existing_url -> $probe_code $probe_effective"
done

while IFS='|' read -r before_id before_name before_state before_health before_restart_count; do
    [[ -n "$before_id" ]] || continue
    docker inspect "$before_id" >/dev/null 2>&1 || fail "Foreign container disappeared: $before_name"
    current_name="$(docker inspect --format '{{.Name}}' "$before_id")"
    current_name="${current_name#/}"
    current_state="$(docker inspect --format '{{.State.Status}}' "$before_id")"
    current_health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$before_id")"
    current_restart_count="$(docker inspect --format '{{.RestartCount}}' "$before_id")"
    [[ "$current_name" == "$before_name" ]] || fail "Foreign container was renamed: $before_name -> $current_name"
    [[ "$current_state" == "$before_state" ]] || fail "Foreign container state changed: $before_name ($before_state -> $current_state)"
    [[ "$current_restart_count" == "$before_restart_count" ]] || fail "Foreign container restarted: $before_name ($before_restart_count -> $current_restart_count)"
    if [[ "$before_health" == "healthy" && "$current_health" != "healthy" ]]; then
        fail "Foreign container lost healthy status: $before_name"
    fi
done < "$STATE_DIR/foreign.before"

if command -v ss >/dev/null 2>&1; then
    ss -H -ltnp | awk '$4 ~ /:80$/ || $4 ~ /:443$/' | sort > "$STATE_DIR/listeners.after"
    cmp -s "$STATE_DIR/listeners.before" "$STATE_DIR/listeners.after" || fail "Listeners on host ports 80/443 changed during deployment."
fi

log "Deployment completed without replacing foreign containers or changing host listeners on 80/443."
log "Quick Tunnel URLs are temporary, public, and can change after a cloudflared restart."
MUTATION_STARTED=0
printf 'AVTOZAKUP_PREVIEW_URL=%s\n' "$tunnel_url"
