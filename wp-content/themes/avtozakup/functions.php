<?php
/** Theme bootstrap. @package Avtozakup */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AVTOZAKUP_THEME_VERSION', '0.12.0' );
define( 'AVTOZAKUP_THEME_DIR', get_template_directory() );
define( 'AVTOZAKUP_THEME_URI', get_template_directory_uri() );

require_once AVTOZAKUP_THEME_DIR . '/inc/helpers.php';

add_action(
	'after_setup_theme',
	static function (): void {
		load_theme_textdomain( 'avtozakup', AVTOZAKUP_THEME_DIR . '/languages' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'custom-logo', array( 'height' => 64, 'width' => 392, 'flex-height' => true, 'flex-width' => true ) );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'align-wide' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'woocommerce' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		register_nav_menus(
			array(
				'primary' => __( 'Основная навигация', 'avtozakup' ),
				'footer_buyers' => __( 'Подвал — покупателям', 'avtozakup' ),
				'footer_business' => __( 'Подвал — автосервисам', 'avtozakup' ),
				'footer_info' => __( 'Подвал — информация', 'avtozakup' ),
			)
		);
	}
);

add_action(
	'wp_enqueue_scripts',
	static function (): void {
		wp_enqueue_style( 'avtozakup-main', AVTOZAKUP_THEME_URI . '/assets/css/main.css', array(), AVTOZAKUP_THEME_VERSION );
		$script_dependencies = array();
		if (
			class_exists( 'WooCommerce' )
			&& function_exists( 'is_cart' )
			&& is_cart()
			&& wp_script_is( 'wc-blocks-data-store', 'registered' )
		) {
			$script_dependencies[] = 'wc-blocks-data-store';
		}
		wp_enqueue_script( 'avtozakup-main', AVTOZAKUP_THEME_URI . '/assets/js/main.js', $script_dependencies, AVTOZAKUP_THEME_VERSION, true );
		if ( class_exists( 'WooCommerce' ) ) {
			wp_enqueue_script( 'wc-add-to-cart' );
		}
	}
);

add_filter(
	'script_loader_tag',
	static function ( string $tag, string $handle ): string {
		return 'avtozakup-main' === $handle ? str_replace( ' src=', ' defer src=', $tag ) : $tag;
	},
	10,
	2
);

add_filter(
	'body_class',
	static function ( array $classes ): array {
		$classes[] = 'az-site';
		if ( is_front_page() ) {
			$classes[] = 'az-home';
		}
		return $classes;
	}
);

add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );

function avtozakup_is_guest_login_page(): bool {
	return function_exists( 'is_account_page' )
		&& is_account_page()
		&& ! is_user_logged_in()
		&& ( ! function_exists( 'is_wc_endpoint_url' ) || ! is_wc_endpoint_url() );
}

function avtozakup_guest_login_woocommerce_text( string $translation, string $text ): string {
	if ( ! avtozakup_is_guest_login_page() ) {
		return $translation;
	}

	$translations = array(
		'Login'                     => 'Вход',
		'Username or email address' => 'Email или логин',
		'Password'                  => 'Пароль',
		'Required'                  => 'Обязательное поле',
		'Remember me'               => 'Запомнить меня',
		'Log in'                    => 'Войти',
		'Lost your password?'       => 'Забыли пароль?',
		'Show password'             => 'Показать пароль',
		'Hide password'             => 'Скрыть пароль',
	);

	return $translations[ $text ] ?? $translation;
}
add_filter( 'gettext_woocommerce', 'avtozakup_guest_login_woocommerce_text', 10, 2 );

function avtozakup_header_cart_count_fragment( array $fragments ): array {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $fragments;
	}

	$fragments['#az-cart-count'] = sprintf(
		'<b id="az-cart-count">%s</b>',
		esc_html( (string) WC()->cart->get_cart_contents_count() )
	);

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'avtozakup_header_cart_count_fragment' );

function avtozakup_render_loop_demo_provenance(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}
	$provenance = avtozakup_demo_product_provenance( $product );
	if ( null === $provenance ) {
		return;
	}
	printf(
		'<div class="az-demo-provenance az-demo-provenance--loop" data-demo-provenance="product">%s</div>',
		esc_html( $provenance['loop'] )
	);
}

function avtozakup_render_single_demo_provenance(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}
	$provenance = avtozakup_demo_product_provenance( $product );
	if ( null === $provenance ) {
		return;
	}
	?>
	<div class="az-demo-provenance az-demo-provenance--single" data-demo-provenance="product" role="note">
		<strong><?php echo esc_html( $provenance['single'] ); ?></strong>
		<?php if ( '' !== $provenance['source'] ) : ?>
			<span class="az-demo-provenance__source"><?php echo esc_html( $provenance['source'] ); ?></span>
		<?php endif; ?>
	</div>
	<?php
}

function avtozakup_render_single_demo_identity(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$identity = avtozakup_demo_product_identity( $product );
	if ( null === $identity ) {
		return;
	}
	?>
	<dl class="az-product-identity" data-product-identity="demo" aria-label="<?php esc_attr_e( 'Идентификация товара', 'avtozakup' ); ?>">
		<?php if ( '' !== $identity['brand'] ) : ?>
			<div class="az-product-identity__item az-product-identity__item--brand">
				<dt class="screen-reader-text"><?php esc_html_e( 'Бренд', 'avtozakup' ); ?></dt>
				<dd data-product-brand><?php echo esc_html( $identity['brand'] ); ?></dd>
			</div>
		<?php endif; ?>
		<?php if ( '' !== $identity['article'] ) : ?>
			<div class="az-product-identity__item az-product-identity__item--article">
				<dt><?php esc_html_e( 'Артикул', 'avtozakup' ); ?></dt>
				<dd data-product-article><?php echo esc_html( $identity['article'] ); ?></dd>
			</div>
		<?php endif; ?>
	</dl>
	<?php
}

function avtozakup_configure_product_detail_layout(): void {
	if ( ! function_exists( 'is_product' ) || ! is_product() ) {
		return;
	}

	remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_title', 5 );
	add_action( 'woocommerce_before_single_product_summary', 'woocommerce_template_single_title', 4 );
	add_action( 'woocommerce_before_single_product_summary', 'avtozakup_render_single_demo_identity', 5 );
}

function avtozakup_is_current_demo_product_page( WC_Product $product ): bool {
	return function_exists( 'is_product' )
		&& is_product()
		&& get_queried_object_id() === $product->get_id()
		&& null !== avtozakup_demo_product_provenance( $product );
}

function avtozakup_render_demo_product_meta(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$technical_sku = avtozakup_demo_technical_sku( $product );
	if ( null === $technical_sku ) {
		woocommerce_template_single_meta();
		return;
	}

	$category_ids   = $product->get_category_ids();
	$category_links = wc_get_product_category_list( $product->get_id(), ', ' );
	?>
	<div class="product_meta az-demo-product-meta" data-demo-product-meta="product">
		<span class="sku_wrapper">
			<?php esc_html_e( 'Технический демо-SKU:', 'avtozakup' ); ?>
			<span class="sku" data-demo-technical-sku><?php echo esc_html( $technical_sku ); ?></span>
		</span>
		<span class="az-demo-product-meta__note"><?php esc_html_e( 'Внутренний идентификатор демо-записи; не OEM и не артикул производителя.', 'avtozakup' ); ?></span>
		<?php if ( '' !== $category_links ) : ?>
			<span class="posted_in">
				<?php echo esc_html( 1 === count( $category_ids ) ? 'Категория:' : 'Категории:' ); ?>
				<?php echo wp_kses_post( $category_links ); ?>
			</span>
		<?php endif; ?>
	</div>
	<?php
}

function avtozakup_configure_demo_product_page(): void {
	if ( ! function_exists( 'is_product' ) || ! is_product() || ! function_exists( 'wc_get_product' ) ) {
		return;
	}

	$product = wc_get_product( get_queried_object_id() );
	if ( ! $product instanceof WC_Product || null === avtozakup_demo_product_provenance( $product ) ) {
		return;
	}

	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
	if ( null !== avtozakup_demo_technical_sku( $product ) ) {
		remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40 );
		add_action( 'woocommerce_single_product_summary', 'avtozakup_render_demo_product_meta', 40 );
	}
}

function avtozakup_demo_product_availability_text( string $availability, WC_Product $product ): string {
	if ( ! avtozakup_is_current_demo_product_page( $product ) ) {
		return $availability;
	}

	return 'Демо-наличие не подтверждено внешними системами';
}

function avtozakup_demo_single_add_to_cart_text( string $text, WC_Product $product ): string {
	if ( ! avtozakup_is_current_demo_product_page( $product ) ) {
		return $text;
	}

	return 'Добавить в демо-корзину';
}

function avtozakup_demo_loop_add_to_cart_text( string $text, WC_Product $product ): string {
	$is_direct_add = $product->is_type( 'simple' )
		&& $product->is_purchasable()
		&& $product->is_in_stock()
		&& $product->supports( 'ajax_add_to_cart' );
	return null !== avtozakup_demo_product_provenance( $product ) && $is_direct_add ? 'Добавить в демо-корзину' : $text;
}

function avtozakup_is_product_search_request(): bool {
	if ( ! is_search() ) {
		return false;
	}

	$post_type = get_query_var( 'post_type' );
	return 'product' === $post_type
		|| ( is_array( $post_type ) && 1 === count( $post_type ) && 'product' === reset( $post_type ) );
}

function avtozakup_keep_product_search_results_page( bool $redirect ): bool {
	return avtozakup_is_product_search_request() ? false : $redirect;
}

function avtozakup_is_catalog_shop_request(): bool {
	return function_exists( 'is_shop' ) && is_shop() && ! is_search();
}

/**
 * Limit the shared listing-card presentation to supported public loops.
 * Product-page related/upsell loops and mixed WordPress search stay native.
 */
function avtozakup_is_product_loop_presentation_request(): bool {
	return avtozakup_is_catalog_shop_request()
		|| ( function_exists( 'is_product_category' ) && is_product_category() )
		|| avtozakup_is_product_search_request();
}

function avtozakup_product_loop_body_class( array $classes ): array {
	if ( avtozakup_is_product_loop_presentation_request() ) {
		$classes[] = 'az-product-loop-page';
	}
	return array_values( array_unique( $classes ) );
}

function avtozakup_product_loop_post_classes( array $classes, WC_Product $product ): array {
	if ( ! avtozakup_is_product_loop_presentation_request() ) {
		return $classes;
	}

	$identity  = avtozakup_loop_product_identity( $product );
	$classes[] = 'az-loop-product-card';
	$classes[] = 'az-loop-product-card--' . $identity['kind'];
	return array_values( array_unique( $classes ) );
}

function avtozakup_render_loop_product_brand(): void {
	if ( ! avtozakup_is_product_loop_presentation_request() ) {
		return;
	}

	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$identity = avtozakup_loop_product_identity( $product );
	if ( '' === $identity['brand'] ) {
		return;
	}

	printf(
		'<span class="az-loop-product-brand" data-loop-product-brand>%s</span>',
		esc_html( $identity['brand'] )
	);
}

function avtozakup_render_loop_product_reference(): void {
	if ( ! avtozakup_is_product_loop_presentation_request() ) {
		return;
	}

	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$identity = avtozakup_loop_product_identity( $product );
	if ( '' === $identity['reference'] ) {
		return;
	}

	printf(
		'<span class="az-loop-product-reference" data-loop-product-reference data-reference-kind="%s">%s: %s</span>',
		esc_attr( $identity['reference_kind'] ),
		esc_html( $identity['reference_label'] ),
		esc_html( $identity['reference'] )
	);
}

function avtozakup_product_search_label(): string {
	$query = sanitize_text_field( get_search_query( false ) );
	return sprintf( 'Поиск товаров: «%s»', $query );
}

function avtozakup_valid_shop_breadcrumb_url(): ?string {
	if ( ! function_exists( 'wc_get_page_id' ) ) {
		return null;
	}

	$shop_page_id = (int) wc_get_page_id( 'shop' );
	$front_page_id = absint( get_option( 'page_on_front' ) );
	if (
		$shop_page_id <= 0
		|| $shop_page_id === $front_page_id
		|| 'page' !== get_post_type( $shop_page_id )
		|| 'publish' !== get_post_status( $shop_page_id )
	) {
		return null;
	}

	$shop_url = get_permalink( $shop_page_id );
	if ( ! is_string( $shop_url ) || '' === $shop_url ) {
		return null;
	}

	return untrailingslashit( $shop_url ) === untrailingslashit( home_url( '/' ) ) ? null : $shop_url;
}

function avtozakup_woocommerce_breadcrumb_defaults( array $defaults ): array {
	$defaults['home'] = 'Главная';
	return $defaults;
}

function avtozakup_woocommerce_breadcrumb_trail( array $crumbs ): array {
	$shop_url = avtozakup_valid_shop_breadcrumb_url();
	if ( null !== $shop_url ) {
		$normalized_shop_url = untrailingslashit( $shop_url );
		foreach ( $crumbs as $index => $crumb ) {
			if ( ! is_array( $crumb ) ) {
				continue;
			}
			$crumb_url = isset( $crumb[1] ) && is_string( $crumb[1] ) ? $crumb[1] : '';
			if (
				isset( $crumb[0] )
				&& is_string( $crumb[0] )
				&& '' !== $crumb_url
				&& untrailingslashit( $crumb_url ) === $normalized_shop_url
			) {
				$crumbs[ $index ][0] = 'Каталог товаров';
			}
		}
	}

	if ( avtozakup_is_product_search_request() && ! is_paged() && count( $crumbs ) >= 2 ) {
		$last_index = array_key_last( $crumbs );
		$last_crumb = null !== $last_index && isset( $crumbs[ $last_index ] ) ? $crumbs[ $last_index ] : null;
		$expected_search_url = remove_query_arg( 'paged' );
		if (
			is_array( $last_crumb )
			&& isset( $last_crumb[0] )
			&& is_string( $last_crumb[0] )
			&& array_key_exists( 1, $last_crumb )
			&& is_string( $last_crumb[1] )
			&& is_string( $expected_search_url )
			&& '' !== $expected_search_url
			&& $expected_search_url === $last_crumb[1]
		) {
			$crumbs[ $last_index ][0] = avtozakup_product_search_label();
		}
	}

	return $crumbs;
}

function avtozakup_woocommerce_page_title( string $title ): string {
	if ( avtozakup_is_catalog_shop_request() ) {
		return 'Каталог товаров';
	}

	if ( ! avtozakup_is_product_search_request() ) {
		return $title;
	}

	return esc_html( avtozakup_product_search_label() );
}

function avtozakup_render_product_search_result_count(): void {
	global $wp_query;
	$count = $wp_query instanceof WP_Query ? (int) $wp_query->found_posts : 0;
	?>
	<p class="woocommerce-result-count" data-product-search-count><?php echo esc_html( sprintf( 'Найдено товаров: %d', $count ) ); ?></p>
	<?php
}

function avtozakup_render_shop_result_count(): void {
	$count = function_exists( 'wc_get_loop_prop' ) ? (int) wc_get_loop_prop( 'total' ) : 0;
	?>
	<p class="woocommerce-result-count" data-shop-product-count><?php echo esc_html( sprintf( 'Товаров в каталоге: %d', $count ) ); ?></p>
	<?php
}

function avtozakup_render_category_result_count(): void {
	$count = function_exists( 'wc_get_loop_prop' ) ? (int) wc_get_loop_prop( 'total' ) : 0;
	?>
	<p class="woocommerce-result-count" data-category-product-count><?php echo esc_html( sprintf( 'Товаров в категории: %d', $count ) ); ?></p>
	<?php
}

function avtozakup_product_description_label( string $label ): string {
	return 'Описание';
}

function avtozakup_render_product_search_empty_state(): void {
	$query = sanitize_text_field( get_search_query( false ) );
	?>
	<section class="az-search-empty" data-product-search-empty role="status" aria-labelledby="az-search-empty-title">
		<h2 id="az-search-empty-title"><?php esc_html_e( 'Товары не найдены', 'avtozakup' ); ?></h2>
		<p>
			<?php esc_html_e( 'По запросу', 'avtozakup' ); ?>
			<strong data-product-search-query>«<?php echo esc_html( $query ); ?>»</strong>
			<?php esc_html_e( 'нет опубликованных товаров. Проверьте написание или вернитесь в каталог.', 'avtozakup' ); ?>
		</p>
		<a class="button" href="<?php echo esc_url( avtozakup_wc_page_url( 'shop' ) ); ?>"><?php esc_html_e( 'Вернуться в каталог', 'avtozakup' ); ?></a>
	</section>
	<?php
}

function avtozakup_configure_product_search_page(): void {
	if ( ! avtozakup_is_product_search_request() ) {
		return;
	}

	remove_action( 'woocommerce_no_products_found', 'wc_no_products_found', 10 );
	add_action( 'woocommerce_no_products_found', 'avtozakup_render_product_search_empty_state', 10 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	add_action( 'woocommerce_before_shop_loop', 'avtozakup_render_product_search_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
}

function avtozakup_configure_catalog_shop_page(): void {
	if ( ! avtozakup_is_catalog_shop_request() ) {
		return;
	}

	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	add_action( 'woocommerce_before_shop_loop', 'avtozakup_render_shop_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
}

function avtozakup_configure_product_category_page(): void {
	if ( ! function_exists( 'is_product_category' ) || ! is_product_category() ) {
		return;
	}

	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	add_action( 'woocommerce_before_shop_loop', 'avtozakup_render_category_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
}

add_action( 'woocommerce_after_shop_loop_item', 'avtozakup_render_loop_demo_provenance', 7 );
add_action( 'woocommerce_shop_loop_item_title', 'avtozakup_render_loop_product_brand', 5 );
add_action( 'woocommerce_shop_loop_item_title', 'avtozakup_render_loop_product_reference', 15 );
add_action( 'woocommerce_single_product_summary', 'avtozakup_render_single_demo_provenance', 11 );
add_action( 'wp', 'avtozakup_configure_product_detail_layout' );
add_action( 'wp', 'avtozakup_configure_demo_product_page' );
add_action( 'wp', 'avtozakup_configure_product_search_page' );
add_action( 'wp', 'avtozakup_configure_catalog_shop_page' );
add_action( 'wp', 'avtozakup_configure_product_category_page' );
add_filter( 'woocommerce_get_availability_text', 'avtozakup_demo_product_availability_text', 10, 2 );
add_filter( 'woocommerce_product_single_add_to_cart_text', 'avtozakup_demo_single_add_to_cart_text', 10, 2 );
add_filter( 'woocommerce_product_add_to_cart_text', 'avtozakup_demo_loop_add_to_cart_text', 10, 2 );
add_filter( 'woocommerce_product_description_tab_title', 'avtozakup_product_description_label' );
add_filter( 'woocommerce_product_description_heading', 'avtozakup_product_description_label' );
add_filter( 'woocommerce_page_title', 'avtozakup_woocommerce_page_title' );
add_filter( 'woocommerce_breadcrumb_defaults', 'avtozakup_woocommerce_breadcrumb_defaults' );
add_filter( 'woocommerce_get_breadcrumb', 'avtozakup_woocommerce_breadcrumb_trail' );
add_filter( 'woocommerce_redirect_single_search_result', 'avtozakup_keep_product_search_results_page' );
add_filter( 'body_class', 'avtozakup_product_loop_body_class' );
add_filter( 'woocommerce_post_class', 'avtozakup_product_loop_post_classes', 10, 2 );

add_action(
	'woocommerce_before_shop_loop',
	static function (): void {
		if ( ! avtozakup_is_catalog_shop_request() ) {
			return;
		}

		$categories = avtozakup_catalog_categories();
		?>
		<section class="az-shop-categories" aria-labelledby="az-shop-categories-title">
			<div class="az-section__heading">
				<h2 id="az-shop-categories-title"><?php esc_html_e( 'Каталог автозапчастей', 'avtozakup' ); ?></h2>
			</div>
			<div class="az-category-grid">
				<?php foreach ( $categories as $index => $category ) : ?>
					<?php avtozakup_category_card( $category, (int) $index ); ?>
				<?php endforeach; ?>
				<?php if ( ! $categories ) : ?>
					<p class="az-empty-state"><?php esc_html_e( 'Опубликованные категории пока отсутствуют.', 'avtozakup' ); ?></p>
				<?php endif; ?>
			</div>
		</section>
		<?php
	},
	5
);

