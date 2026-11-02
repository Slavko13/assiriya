#!/usr/bin/env bash
set -Eeuo pipefail

REPOSITORY_URL="${REPOSITORY_URL:-https://github.com/Slavko13/assiriya.git}"
DEPLOY_BRANCH="main"
INSTALL_DIR="${INSTALL_DIR:-/opt/avtozakup}"
INSTALL_LOCK_DIR="${INSTALL_LOCK_DIR:-${TMPDIR:-/tmp}/avtozakup-quick-tunnel-install.lock}"
install_lock_acquired=0

fail() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

cleanup() {
    if [[ "$install_lock_acquired" == "1" ]]; then
        rmdir -- "$INSTALL_LOCK_DIR" 2>/dev/null || true
    fi
}
trap cleanup EXIT

if [[ "$(id -u)" != "0" ]]; then
    fail "Run this installer through sudo, as shown in the README."
fi

for command_name in git curl; do
    command -v "$command_name" >/dev/null 2>&1 || fail "Required command is missing: $command_name"
done

read -r -a existing_urls <<< "${EXISTING_SITE_URLS:-}"
if [[ "${#existing_urls[@]}" -ne 2 ]]; then
    fail "Set EXISTING_SITE_URLS to the two existing public site URLs before running the installer."
fi
if [[ -z "${EXPECTED_SERVER_IP:-}" ]]; then
    fail "Set EXPECTED_SERVER_IP to the public IPv4 address of the intended server."
fi

if ! mkdir -- "$INSTALL_LOCK_DIR" 2>/dev/null; then
    fail "Another Quick Tunnel installer appears to be running (lock: $INSTALL_LOCK_DIR)."
fi
install_lock_acquired=1

if [[ -e "$INSTALL_DIR" && ! -d "$INSTALL_DIR/.git" ]]; then
    fail "Install path exists but is not a Git checkout: $INSTALL_DIR"
fi

if [[ ! -e "$INSTALL_DIR" ]]; then
    git clone --branch "$DEPLOY_BRANCH" --single-branch "$REPOSITORY_URL" "$INSTALL_DIR"
else
    current_origin="$(git -C "$INSTALL_DIR" remote get-url origin 2>/dev/null || true)"
    if [[ "$current_origin" != "$REPOSITORY_URL" ]]; then
        fail "Unexpected origin in $INSTALL_DIR: ${current_origin:-missing}"
    fi
    if [[ -n "$(git -C "$INSTALL_DIR" status --porcelain)" ]]; then
        fail "The checkout in $INSTALL_DIR has local changes. Preserve or remove them before deployment."
    fi
    git -C "$INSTALL_DIR" fetch --prune origin "$DEPLOY_BRANCH"
    git -C "$INSTALL_DIR" switch "$DEPLOY_BRANCH"
    git -C "$INSTALL_DIR" pull --ff-only origin "$DEPLOY_BRANCH"
fi

"$INSTALL_DIR/scripts/deploy-quick-tunnel.sh"
