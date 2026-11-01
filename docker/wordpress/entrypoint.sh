#!/bin/sh
set -eu

if [ "${AVTOZAKUP_SYNC_CODE:-0}" = "1" ]; then
    theme_target=/var/www/html/wp-content/themes/avtozakup
    plugin_target=/var/www/html/wp-content/plugins/avtozakup-core

    rm -rf -- "$theme_target" "$plugin_target"
    install -d -o www-data -g www-data "$theme_target" "$plugin_target"
    cp -a /opt/avtozakup/theme/. "$theme_target/"
    cp -a /opt/avtozakup/plugin/. "$plugin_target/"
    chown -R www-data:www-data "$theme_target" "$plugin_target"
fi

# uploads is a dedicated named volume and is created as root by Docker. Make
# the mount writable for both Apache/PHP and the wpcli service (uid 33).
mkdir -p /var/www/html/wp-content/uploads
chown -R www-data:www-data /var/www/html/wp-content/uploads

exec docker-entrypoint.sh "$@"
