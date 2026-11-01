#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"

command -v curl >/dev/null 2>&1 || { echo "curl is required." >&2; exit 2; }

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

if [[ -n "${SMOKE_URL:-}" ]]; then
    base_url="${SMOKE_URL%/}"
elif [[ -f "$ENV_FILE" ]]; then
    base_url="$(read_env_value PUBLIC_URL)"
    base_url="${base_url%/}"
else
    echo "Set SMOKE_URL or provide an environment file containing PUBLIC_URL." >&2
    exit 2
fi

[[ "$base_url" =~ ^https?:// ]] || { echo "Invalid smoke-test URL: $base_url" >&2; exit 2; }
[[ "$base_url" =~ ^(https?://[^/]+) ]] || { echo "Could not determine smoke-test origin: $base_url" >&2; exit 2; }
base_origin="${BASH_REMATCH[1]}"

check_url() {
    local path="$1"
    local effective
    effective="$(curl --fail --silent --show-error --location --max-time 20 --connect-timeout 5 --output /dev/null --write-out '%{url_effective}' "${base_url}${path}")"
    if [[ ! "$effective" =~ ^(https?://[^/]+) ]] || [[ "${BASH_REMATCH[1]}" != "$base_origin" ]]; then
        echo "Cross-origin or internal redirect detected for ${path}: ${effective}" >&2
        exit 1
    fi
    echo "OK ${path} -> ${effective}"
}

check_url "/"
check_url "/wp-json/"
check_url "/wp-json/wc/store/v1/products?per_page=1"
echo "Smoke tests passed for $base_url"
