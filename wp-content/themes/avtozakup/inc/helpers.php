<?php
/** Presentation helpers. Business rules belong to avtozakup-core. @package Avtozakup */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** @return array<string, mixed> */
function avtozakup_home_settings(): array {
	$defaults = array(
		'hero_title' => 'НАЙДИТЕ ЗАПЧАСТИ|ПО СВОЕМУ АВТОМОБИЛЮ',
		'hero_text' => 'Укажите автомобиль — покажем подходящие категории и детали.',
		'oil_title' => 'МАСЛА ДЛЯ|КАЖДОГО ТО',
		'oil_text' => 'Надёжная защита двигателя каждый день',
		'oil_button_label' => 'Смотреть масла →',
		'oil_button_url' => '#catalog',
		'oil_image' => AVTOZAKUP_THEME_URI . '/assets/images/hero-oil.webp',
		'vin_title' => 'Подберём нужную деталь',
		'vin_text' => 'Оставьте VIN и описание детали — менеджер поможет с выбором.',
		'vin_image' => AVTOZAKUP_THEME_URI . '/assets/images/vin-engine.avif',
		'b2b_title' => 'Вы занимаетесь ремонтом.|Мы помогаем с запчастями.',
		'b2b_text' => 'Подберём детали, обсудим условия сотрудничества и удобный формат заказов.',
		'b2b_button_label' => 'Узнать условия →',
		'pickup_title' => 'Заберите заказ|по пути на сервис',
		'pickup_text' => 'Выберите удобный способ получения при оформлении заказа.',
		'contact_phone' => '+7 (000) 000-00-00',
		'contact_email' => 'info@example.invalid',
		'maintenance_title' => 'Расходники для планового ТО',
		'maintenance_text' => 'Демонстрационная подборка товаров WooCommerce',
		'stock_title' => 'В наличии на нашем складе',
		'stock_text' => 'Наличие в первой итерации носит демонстрационный характер',
		'featured_category_ids' => array(),
		'maintenance_product_ids' => array(),
		'stock_product_ids' => array(),
	);

	$raw = function_exists( 'avtozakup_get_homepage_settings' ) ? avtozakup_get_homepage_settings() : get_option( 'avtozakup_homepage', array() );
	if ( ! is_array( $raw ) ) {
		$raw = array();
	}
	$mapped = array(
		'hero_title' => $raw['hero_title'] ?? null,
		'hero_text' => $raw['hero_text'] ?? null,
		'vin_title' => $raw['vin_title'] ?? null,
		'vin_text' => $raw['vin_text'] ?? null,
		'b2b_title' => $raw['b2b_title'] ?? null,
		'b2b_text' => $raw['b2b_text'] ?? null,
		'b2b_button_label' => $raw['b2b_button_label'] ?? null,
		'pickup_title' => $raw['delivery_title'] ?? null,
		'pickup_text' => $raw['delivery_text'] ?? null,
		'contact_phone' => $raw['contact_phone'] ?? null,
		'contact_email' => $raw['contact_email'] ?? null,
		'maintenance_title' => $raw['popular_title'] ?? null,
		'maintenance_text' => $raw['popular_text'] ?? null,
		'stock_title' => $raw['stock_title'] ?? null,
		'stock_text' => $raw['stock_text'] ?? null,
		'featured_category_ids' => $raw['category_ids'] ?? null,
		'maintenance_product_ids' => $raw['popular_product_ids'] ?? null,
		'stock_product_ids' => $raw['stock_product_ids'] ?? null,
	);
	if ( ! empty( $raw['hero_image_id'] ) ) {
		$image = wp_get_attachment_image_url( absint( $raw['hero_image_id'] ), 'full' );
		if ( $image ) {
			$mapped['oil_image'] = $image;
		}
	}

	return array_replace( $defaults, array_filter( $mapped, static fn( $value ) => '' !== $value && null !== $value ) );
}

function avtozakup_heading_lines( string $value, bool $accent_first = false ): void {
	$lines = array_map( 'trim', explode( '|', $value, 2 ) );
	printf( '<span class="az-heading-line%s">%s</span>', esc_attr( $accent_first ? ' az-accent' : '' ), esc_html( $lines[0] ?? '' ) );
	if ( ! empty( $lines[1] ) ) {
		printf( '<span class="az-heading-line%s">%s</span>', esc_attr( $accent_first ? '' : ' az-accent' ), esc_html( $lines[1] ) );
	}
}

/** @return WP_Term[] */
function avtozakup_home_categories(): array {
	$settings = avtozakup_home_settings();
	$ids = array_values( array_filter( array_map( 'absint', (array) $settings['featured_category_ids'] ) ) );
	$args = array( 'taxonomy' => 'product_cat', 'hide_empty' => false, 'parent' => 0, 'number' => 8 );
	if ( $ids ) {
		$args['include'] = $ids;
		$args['orderby'] = 'include';
	} else {
		$args['orderby'] = 'menu_order';
	}
	$terms = taxonomy_exists( 'product_cat' ) ? get_terms( $args ) : array();
	return is_wp_error( $terms ) ? array() : $terms;
}

/** @return WP_Term[] */
function avtozakup_catalog_categories(): array {
	return array_values(
		array_filter(
			avtozakup_home_categories(),
			static fn ( WP_Term $term ): bool => 0 === (int) $term->parent
		)
	);
}

/** @return WC_Product[] */
function avtozakup_home_products( string $setting_key ): array {
	if ( ! function_exists( 'wc_get_products' ) ) {
		return array();
	}
	$settings = avtozakup_home_settings();
	$ids = array_values( array_filter( array_map( 'absint', (array) ( $settings[ $setting_key ] ?? array() ) ) ) );
	$args = array( 'limit' => 5, 'status' => 'publish' );
	if ( $ids ) {
		$args['include'] = $ids;
		$args['orderby'] = 'include';
	} else {
		$args['orderby'] = 'date';
		$args['order'] = 'DESC';
	}
	return wc_get_products( $args );
}

function avtozakup_icon( string $name, string $class = '' ): string {
	$icons = array(
		'pin' => '<path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/>',
		'chevron' => '<path d="m8 10 4 4 4-4"/>',
		'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
		'search' => '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
		'user' => '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/>',
		'cart' => '<path d="M3 4h2l2 11h10l2-7H6"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
		'car' => '<path d="m5 14 2-5h10l2 5v4h-2v-2H7v2H5v-4Z"/><path d="M4 13h16"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
		'vin' => '<path d="M5 4v16M8 5v14M12 4v16M16 5v14M20 4v16"/>',
		'headset' => '<path d="M5 13v-2a7 7 0 0 1 14 0v2"/><path d="M5 12H3v5h4v-5H5Zm14 0h2v5h-4v-5h2ZM17 18c-1 2-3 2-5 2"/>',
		'box' => '<path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
		'swap' => '<path d="M5 8h13l-3-3M19 16H6l3 3"/>',
		'shield' => '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
		'heart' => '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
		'arrow' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'check' => '<path d="m5 12 4 4L19 6"/>',
	);
	return sprintf( '<svg class="az-icon %s" viewBox="0 0 24 24" aria-hidden="true" focusable="false">%s</svg>', esc_attr( $class ), $icons[ $name ] ?? $icons['arrow'] );
}

function avtozakup_category_illustration( int $index ): string {
	$kind = ( $index % 8 ) + 1;
	return sprintf( '<span class="az-category-art az-category-art--%d" aria-hidden="true"><i></i><b></b><em></em></span>', $kind );
}

function avtozakup_category_card( WP_Term $category, int $index ): void {
	$term_link = get_term_link( $category );
	$target = is_wp_error( $term_link ) ? avtozakup_wc_page_url( 'shop' ) : $term_link;
	?>
	<a class="az-category-card" href="<?php echo esc_url( $target ); ?>" data-category-id="<?php echo esc_attr( (string) absint( $category->term_id ) ); ?>">
		<?php echo avtozakup_category_illustration( $index ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<span><?php echo esc_html( $category->name ); ?></span>
	</a>
	<?php
}

/**
 * Return public-safe provenance for an explicitly marked demo product.
 * Unknown source metadata is intentionally not exposed.
 *
 * @return array{loop:string,single:string,source:string}|null
 */
function avtozakup_demo_product_provenance( WC_Product $product ): ?array {
	$is_demo = '1' === (string) $product->get_meta( '_avtozakup_demo', true )
		|| 'yes' === (string) $product->get_meta( '_az_demo_product', true );
	if ( ! $is_demo ) {
		return null;
	}

	$source_key = strtolower( preg_replace( '/\s+/', '', (string) $product->get_meta( '_avtozakup_demo_source', true ) ) );
	$source_labels = array(
		'paper:scr-002,scr-006,scr-007,scr-009' => 'Источник демо-данных: Paper SCR-002, SCR-006, SCR-007, SCR-009',
	);

	return array(
		'loop'   => 'Демонстрационный товар · цена и наличие не подтверждены',
		'single' => 'Демонстрационный товар. Цена, остаток, срок поставки и применяемость не подтверждены внешними системами.',
		'source' => $source_labels[ $source_key ] ?? '',
	);
}

/**
 * Return the public brand/article pair owned by an explicitly marked demo.
 *
 * Synthetic WooCommerce SKUs are deliberately excluded: they identify the
 * seeded record, not the product represented by the demo content.
 *
 * @return array{brand:string,article:string}|null
 */
function avtozakup_demo_product_identity( WC_Product $product ): ?array {
	if ( null === avtozakup_demo_product_provenance( $product ) ) {
		return null;
	}

	$brand   = trim( sanitize_text_field( (string) $product->get_meta( '_avtozakup_demo_brand', true ) ) );
	$article = trim( sanitize_text_field( (string) $product->get_meta( '_avtozakup_demo_article', true ) ) );
	if ( '' === $brand && '' === $article ) {
		return null;
	}

	return array(
		'brand'   => $brand,
		'article' => $article,
	);
}

/**
 * Return public identity fields that may be shown in a native product loop.
 *
 * Marked demo records expose only their curated brand/article pair. Products
 * created by an administrator keep their native brand attribute and SKU.
 * Synthetic demo SKUs never cross this boundary.
 *
 * @return array{kind:string,brand:string,reference:string,reference_kind:string,reference_label:string}
 */
function avtozakup_loop_product_identity( WC_Product $product ): array {
	$provenance = avtozakup_demo_product_provenance( $product );
	if ( null !== $provenance ) {
		$identity = avtozakup_demo_product_identity( $product );
		return array(
			'kind'            => 'demo',
			'brand'           => null !== $identity ? $identity['brand'] : '',
			'reference'       => null !== $identity ? $identity['article'] : '',
			'reference_kind'  => 'article',
			'reference_label' => 'Артикул',
		);
	}

	return array(
		'kind'            => 'standard',
		'brand'           => trim( sanitize_text_field( (string) $product->get_attribute( 'pa_brand' ) ) ),
		'reference'       => trim( sanitize_text_field( (string) $product->get_sku() ) ),
		'reference_kind'  => 'sku',
		'reference_label' => 'SKU',
	);
}

/**
 * Return the synthetic SKU owned by the demo seeder.
 * A marked product with any other SKU keeps the standard WooCommerce meta UI.
 */
function avtozakup_demo_technical_sku( WC_Product $product ): ?string {
	if ( null === avtozakup_demo_product_provenance( $product ) ) {
		return null;
	}

	$sku = (string) $product->get_sku();
	return 1 === preg_match( '/\AAZ-DEMO-\d{3}\z/', $sku ) ? $sku : null;
}

/**
 * Localize only untouched WooCommerce default loop labels inside the custom
 * homepage renderer. Merchant/plugin-provided labels pass through unchanged.
 */
function avtozakup_home_loop_add_to_cart_text( string $text, WC_Product $_product ): string {
	$labels = array(
		'Add to cart'    => 'В корзину',
		'Select options' => 'Выбрать параметры',
		'View products'   => 'Посмотреть товары',
		'Read more'       => 'Подробнее',
	);

	return $labels[ $text ] ?? $text;
}

function avtozakup_product_card( WC_Product $product ): void {
	$identity   = avtozakup_loop_product_identity( $product );
	$provenance = avtozakup_demo_product_provenance( $product );
	$permalink  = $product->get_permalink();
	?>
	<article class="az-product-card az-product-card--<?php echo esc_attr( $identity['kind'] ); ?>" data-home-product-card data-product-id="<?php echo esc_attr( (string) $product->get_id() ); ?>">
		<a class="az-product-card__media" href="<?php echo esc_url( $permalink ); ?>" aria-label="<?php echo esc_attr( $product->get_name() ); ?>">
			<?php echo wp_kses_post( $product->get_image( 'woocommerce_thumbnail', array( 'loading' => 'lazy' ) ) ); ?>
		</a>
		<div class="az-product-card__body">
			<?php if ( '' !== $identity['brand'] ) : ?>
				<div class="az-product-card__brand" data-home-product-brand><?php echo esc_html( $identity['brand'] ); ?></div>
			<?php endif; ?>
			<a class="az-product-card__title" href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $product->get_name() ); ?></a>
			<?php if ( '' !== $identity['reference'] ) : ?>
				<div class="az-product-card__reference" data-home-product-reference data-reference-kind="<?php echo esc_attr( $identity['reference_kind'] ); ?>"><?php echo esc_html( sprintf( '%s: %s', $identity['reference_label'], $identity['reference'] ) ); ?></div>
			<?php endif; ?>
			<div class="az-product-card__footer">
				<div class="az-product-card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
				<?php if ( null !== $provenance ) : ?>
					<div class="az-product-card__provenance" data-demo-provenance="product"><?php echo esc_html( $provenance['loop'] ); ?></div>
				<?php endif; ?>
				<div class="az-product-card__action">
					<?php
					$had_global_product = array_key_exists( 'product', $GLOBALS );
					$global_product     = $GLOBALS['product'] ?? null;
					add_filter( 'woocommerce_product_add_to_cart_text', 'avtozakup_home_loop_add_to_cart_text', 20, 2 );
					try {
						$GLOBALS['product'] = $product;
						woocommerce_template_loop_add_to_cart();
					} finally {
						remove_filter( 'woocommerce_product_add_to_cart_text', 'avtozakup_home_loop_add_to_cart_text', 20 );
						if ( $had_global_product ) {
							$GLOBALS['product'] = $global_product;
						} else {
							unset( $GLOBALS['product'] );
						}
					}
					?>
				</div>
			</div>
		</div>
	</article>
	<?php
}

function avtozakup_wc_page_url( string $page ): string {
	if ( function_exists( 'wc_get_page_id' ) ) {
		$id = wc_get_page_id( $page );
		if ( $id > 0 ) {
			return get_permalink( $id );
		}
	}
	return home_url( '/' );
}

function avtozakup_primary_menu_fallback(): void {
	echo '<ul class="az-primary-menu"><li><a href="' . esc_url( home_url( '/product-category/oils/' ) ) . '">' . esc_html__( 'Масла и жидкости', 'avtozakup' ) . '</a></li><li><a href="' . esc_url( home_url( '/product-category/maintenance/' ) ) . '">' . esc_html__( 'Запчасти для ТО', 'avtozakup' ) . '</a></li><li><a href="#business">' . esc_html__( 'Для автосервисов', 'avtozakup' ) . '</a></li></ul>';
}

function avtozakup_footer_buyers_fallback(): void {
	echo '<ul><li><a href="' . esc_url( avtozakup_wc_page_url( 'shop' ) ) . '">' . esc_html__( 'Каталог товаров', 'avtozakup' ) . '</a></li><li><a href="' . esc_url( home_url( '/delivery/' ) ) . '">' . esc_html__( 'Доставка и оплата', 'avtozakup' ) . '</a></li><li><a href="' . esc_url( home_url( '/returns/' ) ) . '">' . esc_html__( 'Гарантия и возврат', 'avtozakup' ) . '</a></li><li><a href="' . esc_url( avtozakup_wc_page_url( 'myaccount' ) ) . '">' . esc_html__( 'Мои заказы', 'avtozakup' ) . '</a></li></ul>';
}

function avtozakup_footer_business_fallback(): void {
	echo '<ul><li><a href="#business">' . esc_html__( 'Для автосервисов', 'avtozakup' ) . '</a></li><li><button type="button" data-status-dialog="b2b" aria-haspopup="dialog">' . esc_html__( 'Условия сотрудничества', 'avtozakup' ) . '</button></li><li><button type="button" data-contact-open aria-haspopup="dialog">' . esc_html__( 'Запросить предложение', 'avtozakup' ) . '</button></li><li><a href="' . esc_url( home_url( '/faq/' ) ) . '">' . esc_html__( 'Частые вопросы', 'avtozakup' ) . '</a></li></ul>';
}

function avtozakup_footer_info_fallback(): void {
	echo '<ul><li><a href="' . esc_url( home_url( '/about/' ) ) . '">' . esc_html__( 'О магазине', 'avtozakup' ) . '</a></li><li><button type="button" data-contact-open aria-haspopup="dialog">' . esc_html__( 'Контакты', 'avtozakup' ) . '</button></li><li><a href="' . esc_url( home_url( '/documents/' ) ) . '">' . esc_html__( 'Документы', 'avtozakup' ) . '</a></li><li><a href="' . esc_url( get_privacy_policy_url() ?: home_url( '/privacy/' ) ) . '">' . esc_html__( 'Политика конфиденциальности', 'avtozakup' ) . '</a></li></ul>';
}

