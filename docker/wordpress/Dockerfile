FROM wordpress:7.1.4-php8.3-apache

ARG WOOCOMMERCE_VERSION=11.2.1
ENV WOOCOMMERCE_VERSION=${WOOCOMMERCE_VERSION}

COPY docker/wordpress/uploads.ini /usr/local/etc/php/conf.d/avtozakup-uploads.ini
COPY docker/wordpress/entrypoint.sh /usr/local/bin/avtozakup-entrypoint
COPY --chown=33:33 wp-content/themes/avtozakup /opt/avtozakup/theme
COPY --chown=33:33 wp-content/plugins/avtozakup-core /opt/avtozakup/plugin

RUN set -eux; \
    chmod 0755 /usr/local/bin/avtozakup-entrypoint; \
    a2enmod expires headers remoteip rewrite

ENTRYPOINT ["avtozakup-entrypoint"]
CMD ["apache2-foreground"]

LABEL org.opencontainers.image.title="АВТОЗАКУП WordPress" \
      org.opencontainers.image.description="Pinned WordPress runtime for the АВТОЗАКУП store" \
      org.opencontainers.image.version="7.1.4"
