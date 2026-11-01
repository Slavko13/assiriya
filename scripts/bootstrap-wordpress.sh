#!/bin/sh
set -eu

WP_PATH="${WP_PATH:-/var/www/html}"

required_vars="WP_HOME WP_SITE_TITLE WP_ADMIN_USER WP_ADMIN_PASSWORD WP_ADMIN_EMAIL WP_LOCALE WOOCOMMERCE_VERSION"
for variable in $required_vars; do
    eval "value=\${$variable:-}"
    if [ -z "$value" ]; then
        echo "Required environment variable is missing: $variable" >&2
        exit 2
    fi
done

wp_cmd() {
    wp --path="$WP_PATH" --allow-root "$@"
}

echo "Waiting for WordPress files and database connectivity..."
attempt=0
until wp_cmd db check >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "Database did not become ready in time." >&2
        exit 1
    fi
    sleep 2
done

if ! wp_cmd core is-installed >/dev/null 2>&1; then
    wp_cmd core install \
        --url="$WP_HOME" \
        --title="$WP_SITE_TITLE" \
        --admin_user="$WP_ADMIN_USER" \
        --admin_password="$WP_ADMIN_PASSWORD" \
        --admin_email="$WP_ADMIN_EMAIL" \
        --skip-email
else
    echo "WordPress is already installed; preserving existing users and content."
fi

current_home="$(wp_cmd option get home 2>/dev/null || true)"
if [ "$current_home" != "$WP_HOME" ]; then
    wp_cmd option update home "$WP_HOME"
fi

current_siteurl="$(wp_cmd option get siteurl 2>/dev/null || true)"
if [ "$current_siteurl" != "${WP_SITEURL:-$WP_HOME}" ]; then
    wp_cmd option update siteurl "${WP_SITEURL:-$WP_HOME}"
fi

wp_cmd option update timezone_string "${WP_TIMEZONE:-Europe/Moscow}"

# Core translations are idempotent. A transient language-pack outage must not
# destroy an otherwise usable local installation.
if ! wp_cmd language core is-installed "$WP_LOCALE" >/dev/null 2>&1; then
    wp_cmd language core install "$WP_LOCALE" --activate || echo "Could not install locale $WP_LOCALE; continuing with the bundled locale." >&2
else
    wp_cmd site switch-language "$WP_LOCALE"
fi

current_permalink="$(wp_cmd option get permalink_structure 2>/dev/null || true)"
if [ "$current_permalink" != "/%postname%/" ]; then
    wp_cmd rewrite structure '/%postname%/' --hard
fi

installed_wc_version="$(wp_cmd plugin get woocommerce --field=version 2>/dev/null || true)"
if [ -z "$installed_wc_version" ]; then
    echo "Installing WooCommerce ${WOOCOMMERCE_VERSION} (current: ${installed_wc_version:-not installed})..."
    wp_cmd plugin install woocommerce --version="$WOOCOMMERCE_VERSION" --activate
elif [ "$installed_wc_version" = "$WOOCOMMERCE_VERSION" ]; then
    wp_cmd plugin activate woocommerce
elif php -r 'exit(version_compare($argv[1], $argv[2], ">") ? 0 : 1);' "$installed_wc_version" "$WOOCOMMERCE_VERSION"; then
    echo "WooCommerce ${installed_wc_version} is newer than the pinned bootstrap version ${WOOCOMMERCE_VERSION}; keeping the installed version." >&2
    wp_cmd plugin activate woocommerce
else
    echo "Updating WooCommerce from ${installed_wc_version} to ${WOOCOMMERCE_VERSION}..."
    wp_cmd plugin install woocommerce --version="$WOOCOMMERCE_VERSION" --force --activate
fi

# WooCommerce owns its standard pages; this operation is safe to repeat.
wp_cmd eval 'if (class_exists("WC_Install")) { WC_Install::create_pages(); }'

if [ -n "${WP_PLUGIN:-}" ] && wp_cmd plugin is-installed "$WP_PLUGIN" >/dev/null 2>&1; then
    wp_cmd plugin activate "$WP_PLUGIN"
else
    echo "Custom plugin '${WP_PLUGIN:-avtozakup-core}' is not available yet; bootstrap continues." >&2
fi

if [ -n "${WP_THEME:-}" ] && wp_cmd theme is-installed "$WP_THEME" >/dev/null 2>&1; then
    wp_cmd theme activate "$WP_THEME"
else
    echo "Custom theme '${WP_THEME:-avtozakup}' is not available yet; bootstrap continues." >&2
fi

if wp_cmd help avtozakup seed-demo >/dev/null 2>&1; then
    if wp_cmd option get avtozakup_demo_manifest >/dev/null 2>&1; then
        wp_cmd avtozakup seed-demo
    else
        wp_cmd avtozakup seed-demo --force
    fi
else
    echo "Avtozakup demo seeder is unavailable; no demo catalog was created." >&2
fi

wp_cmd rewrite flush --hard
echo "WordPress bootstrap completed successfully."
