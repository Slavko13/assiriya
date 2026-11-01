<?php
/**
 * Idempotent demo content seeder for the first iteration.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

use RuntimeException;
use WC_Product_Simple;
use WP_Post;
use WP_Term;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Demo_Seeder {
	public const DEMO_META = '_avtozakup_demo';
	public const DEMO_KEY_META = '_avtozakup_demo_key';
	public const DEMO_SOURCE_META = '_avtozakup_demo_source';
	public const MANIFEST_OPTION = 'avtozakup_demo_manifest';

	/**
	 * Seed marked demo content without claiming that stock, prices or fitment
	 * are real. Existing unmarked content is never modified.
	 *
	 * @return array<string, mixed>
	 */
	public function seed( bool $force = false ): array {
		if ( ! class_exists( 'WooCommerce' ) || ! class_exists( WC_Product_Simple::class ) ) {
			throw new RuntimeException( 'WooCommerce must be active before demo data can be seeded.' );
		}

		if ( ! taxonomy_exists( 'product_cat' ) ) {
			throw new RuntimeException( 'WooCommerce product categories are not registered.' );
		}

		$theme_status = $this->maybe_activate_theme();
		$this->configure_demo_store( $force );
		$media = $this->seed_media();
		$categories = $this->seed_categories();
		$products = $this->seed_products( $categories, $media );
		$pages = $this->seed_pages();
		$this->configure_core_pages( $pages, $force );
		$menu = $this->seed_menu( $pages, $categories, $force );
		$this->update_homepage_settings( $categories, $products, $pages, $media, $force );

		$manifest = array(
			'version'      => AVTOZAKUP_CORE_VERSION,
			'seeded_at'    => current_time( 'mysql', true ),
			'categories'   => $categories,
			'products'     => $products,
			'attachments'  => $media,
			'pages'        => $pages,
			'menu_id'      => $menu['menu_id'],
			'menu_location'=> $menu['location'],
			'theme'        => $theme_status,
		);

		update_option( self::MANIFEST_OPTION, $manifest, false );

		return $manifest;
	}

	/**
	 * Apply presentation-only WooCommerce defaults when the caller explicitly
	 * requests a forced demo seed. A normal idempotent refresh never overwrites
	 * store settings that an administrator may have changed.
	 */
	private function configure_demo_store( bool $force ): void {
		// WooCommerce enables a "Coming soon" curtain on fresh installs. This
		// project is an explicitly labelled local demo, so its catalog, cart and
		// guarded checkout must remain reachable for acceptance testing.
		update_option( 'woocommerce_coming_soon', 'no' );
		update_option( 'woocommerce_store_pages_only', 'no' );

		if ( ! $force ) {
			return;
		}

		$options = array(
			'woocommerce_currency'            => 'RUB',
			'woocommerce_currency_pos'        => 'right_space',
			'woocommerce_price_thousand_sep'  => ' ',
			'woocommerce_price_decimal_sep'   => ',',
			'woocommerce_price_num_decimals'  => '0',
		);

		foreach ( $options as $option => $value ) {
			update_option( $option, $value );
		}
	}

	/** @return array<string, int> */
	private function seed_categories(): array {
		$definitions = array(
			'filters'     => array( 'Запчасти для ТО', 'zapchasti-dlya-to' ),
			'brakes'      => array( 'Тормозная система', 'tormoznaya-sistema' ),
			'suspension'  => array( 'Подвеска и рулевое', 'podveska-i-rulevoe' ),
			'engine'      => array( 'Двигатель и привод', 'dvigatel-i-privod' ),
			'oils'        => array( 'Масла и жидкости', 'masla-i-zhidkosti' ),
			'electrics'   => array( 'Электрика и зажигание', 'elektrika-i-zazhiganie' ),
			'cooling'     => array( 'Автохимия', 'avtohimiya' ),
			'body'        => array( 'Инструменты для СТО', 'instrumenty-dlya-sto' ),
		);
		$result = array();

		foreach ( $definitions as $key => $definition ) {
			$demo_key = 'category:' . $key;
			$term = $this->find_demo_term( $demo_key );
			$description = 'Демонстрационная категория первой итерации по структуре каталога Paper. Не является источником реального ассортимента.';

			if ( $term instanceof WP_Term ) {
				$updated = wp_update_term(
					$term->term_id,
					'product_cat',
					array( 'name' => $definition[0], 'description' => $description )
				);
				if ( is_wp_error( $updated ) ) {
					throw new RuntimeException( $updated->get_error_message() );
				}
				$term_id = $term->term_id;
			} else {
				$slug = $this->available_term_slug( $definition[1] );
				$inserted = wp_insert_term(
					$definition[0],
					'product_cat',
					array( 'slug' => $slug, 'description' => $description )
				);
				if ( is_wp_error( $inserted ) ) {
					throw new RuntimeException( $inserted->get_error_message() );
				}
				$term_id = absint( $inserted['term_id'] );
			}

			update_term_meta( $term_id, self::DEMO_META, '1' );
			update_term_meta( $term_id, self::DEMO_KEY_META, $demo_key );
			update_term_meta( $term_id, self::DEMO_SOURCE_META, 'paper:scr-002,scr-005' );
			$result[ $key ] = $term_id;
		}

		return $result;
	}

	/** @return array<string, int> */
	private function seed_media(): array {
		$files = array(
			'product-filter.jpg' => 'Демонстрационный масляный фильтр',
			'product-oil.jpg' => 'Демонстрационное моторное масло',
			'product-spark.jpg' => 'Демонстрационная свеча зажигания',
			'product-pads.jpg' => 'Демонстрационные тормозные колодки',
			'product-disc.jpg' => 'Демонстрационный тормозной диск',
			'product-belt.jpg' => 'Демонстрационный комплект ремня ГРМ',
			'product-shock.jpg' => 'Демонстрационный амортизатор',
			'product-alternator.jpg' => 'Демонстрационный генератор',
			'hero-oil.webp' => 'Масло — изображение первого экрана',
			'vin-engine.avif' => 'Двигатель — иллюстрация VIN-блока',
		);
		$base_path = WP_CONTENT_DIR . '/themes/avtozakup/assets/images/';
		$result = array();

		foreach ( $files as $filename => $title ) {
			$demo_key = 'media:' . $filename;
			$attachment_id = $this->find_demo_post_id( 'attachment', $demo_key );
			if ( $attachment_id > 0 ) {
				$result[ $filename ] = $attachment_id;
				continue;
			}

			$source = $base_path . $filename;
			if ( ! is_readable( $source ) ) {
				continue;
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$temp = wp_tempnam( $filename );
			if ( ! is_string( $temp ) || '' === $temp || ! copy( $source, $temp ) ) {
				continue;
			}

			$uploaded = media_handle_sideload(
				array( 'name' => $filename, 'tmp_name' => $temp ),
				0,
				$title,
				array( 'post_status' => 'inherit' )
			);
			if ( is_wp_error( $uploaded ) ) {
				if ( file_exists( $temp ) ) {
					wp_delete_file( $temp );
				}
				continue;
			}

			$attachment_id = absint( $uploaded );
			update_post_meta( $attachment_id, self::DEMO_META, '1' );
			update_post_meta( $attachment_id, self::DEMO_KEY_META, $demo_key );
			update_post_meta( $attachment_id, self::DEMO_SOURCE_META, 'theme:assets/images/' . $filename );
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', $title );
			$result[ $filename ] = $attachment_id;
		}

		return $result;
	}

	/**
	 * @param array<string, int> $categories Category IDs by stable key.
	 * @param array<string, int> $media      Attachment IDs by filename key.
	 * @return array<string, int>
	 */
	private function seed_products( array $categories, array $media ): array {
		$definitions = array(
			'brake-disc' => array( 'Тормозной диск Brembo 09.A727.11', 'Brembo', '09.A727.11', 'brakes', '3290', 12, 'product-disc.jpg' ),
			'brake-pads' => array( 'Комплект тормозных колодок Bosch 0 986 494 563', 'Bosch', '0 986 494 563', 'brakes', '2890', 8, 'product-pads.jpg' ),
			'oil-filter' => array( 'Масляный фильтр MANN-FILTER W 914/2', 'MANN-FILTER', 'W 914/2', 'filters', '890', 24, 'product-filter.jpg' ),
			'cabin-filter' => array( 'Фильтр салона MAHLE CU 2939', 'MAHLE', 'CU 2939', 'filters', '1290', 16, '' ),
			'engine-oil' => array( 'Моторное масло LUKOIL GENESIS ARMORTECH 5W-40, 4 л', 'LUKOIL', '3148675', 'oils', '2790', 18, 'product-oil.jpg' ),
			'spark-plug' => array( 'Свеча зажигания NGK BCPR6ES-11', 'NGK', 'BCPR6ES-11', 'engine', '690', 40, 'product-spark.jpg' ),
			'shock'      => array( 'Амортизатор SACHS 312 267', 'SACHS', '312 267', 'suspension', '6590', 6, 'product-shock.jpg' ),
			'timing-kit' => array( 'Комплект ремня ГРМ Gates K015631XS', 'Gates', 'K015631XS', 'engine', '8490', 5, 'product-belt.jpg' ),
			'alternator' => array( 'Генератор Bosch 0 986 084 220', 'Bosch', '0 986 084 220', 'electrics', '8990', 4, 'product-alternator.jpg' ),
			'radiator'   => array( 'Радиатор охлаждения LUZAR LRC 0190', 'LUZAR', 'LRC 0190', 'cooling', '7490', 3, '' ),
		);
		$result = array();
		$position = 0;

		foreach ( $definitions as $key => $definition ) {
			++$position;
			$demo_key = 'product:' . $key;
			$product_id = $this->find_demo_post_id( 'product', $demo_key );
			$product = $product_id > 0 ? wc_get_product( $product_id ) : new WC_Product_Simple();

			if ( ! $product instanceof WC_Product_Simple ) {
				throw new RuntimeException( sprintf( 'Marked demo product %s is no longer a simple WooCommerce product.', $demo_key ) );
			}

			$sku = 'AZ-DEMO-' . str_pad( (string) $position, 3, '0', STR_PAD_LEFT );
			$sku_owner = wc_get_product_id_by_sku( $sku );
			if ( $sku_owner > 0 && $sku_owner !== $product->get_id() ) {
				throw new RuntimeException( sprintf( 'SKU collision for %s. Existing content was not changed.', $sku ) );
			}

			$product->set_name( $definition[0] );
			$product->set_status( 'publish' );
			$product->set_catalog_visibility( 'visible' );
			$product->set_description( 'Демонстрационная карточка первой итерации. Цена, остаток, применяемость и срок поставки не подтверждены внешними системами.' );
			$product->set_short_description( sprintf( 'Демо-товар · %s · артикул %s', $definition[1], $definition[2] ) );
			$product->set_sku( $sku );
			$product->set_regular_price( $definition[4] );
			$product->set_price( $definition[4] );
			$product->set_manage_stock( true );
			$product->set_stock_quantity( $definition[5] );
			$product->set_stock_status( 'instock' );
			$product->set_backorders( 'no' );
			$product->set_reviews_allowed( false );
			$product->set_category_ids( array( $categories[ $definition[3] ] ) );
			$product->set_image_id( '' !== $definition[6] ? absint( $media[ $definition[6] ] ?? 0 ) : 0 );
			$product->update_meta_data( self::DEMO_META, '1' );
			$product->update_meta_data( self::DEMO_KEY_META, $demo_key );
			$product->update_meta_data( self::DEMO_SOURCE_META, 'paper:scr-002,scr-006,scr-007,scr-009' );
			$product->update_meta_data( '_avtozakup_demo_brand', $definition[1] );
			$product->update_meta_data( '_avtozakup_demo_article', $definition[2] );
			$saved_id = $product->save();

			if ( $saved_id <= 0 ) {
				throw new RuntimeException( sprintf( 'Could not save demo product %s.', $demo_key ) );
			}
			$result[ $key ] = $saved_id;
		}

		return $result;
	}

	/** @return array<string, int> */
	private function seed_pages(): array {
		$definitions = array(
			'home' => array( 'Автозакуп', 'home', '<!-- wp:paragraph --><p>Главная страница выводится темой «Автозакуп» и редактируется в разделе «Автозакуп → Главная».</p><!-- /wp:paragraph -->' ),
			'shop' => array( 'Каталог', 'shop', '' ),
			'cart' => array( 'Корзина', 'cart', '[woocommerce_cart]' ),
			'checkout' => array( 'Оформление заказа', 'checkout', '[woocommerce_checkout]' ),
			'delivery' => array( 'Доставка и оплата', 'delivery', '<!-- wp:heading --><h2>Доставка и оплата</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Страница подготовлена для демонстрации. Реальные способы, стоимость и сроки будут опубликованы после утверждения правил и подключения сервисов.</p><!-- /wp:paragraph -->' ),
			'returns' => array( 'Возврат', 'returns', '<!-- wp:heading --><h2>Возврат</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Демонстрационная страница не заменяет утверждённые правила возврата. Онлайн-регистрация возвратов пока не выполняется.</p><!-- /wp:paragraph -->' ),
			'vin' => array( 'Подбор по VIN', 'vin-request', '<!-- wp:heading --><h2>Подбор по VIN</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Функция ещё не подключена: эта страница не принимает и не сохраняет VIN или персональные данные.</p><!-- /wp:paragraph -->' ),
			'business' => array( 'Для бизнеса', 'business', '<!-- wp:heading --><h2>Для бизнеса</h2><!-- /wp:heading --><!-- wp:paragraph --><p>B2B-регистрация, специальные цены и счета не активированы. Условия появятся после утверждения правил проверки организаций.</p><!-- /wp:paragraph -->' ),
			'contacts' => array( 'Контакты', 'contacts', '<!-- wp:heading --><h2>Контакты</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Контактные данные первой итерации редактируются в разделе «Автозакуп → Главная».</p><!-- /wp:paragraph -->' ),
		);
		$result = array();

		foreach ( $definitions as $key => $definition ) {
			$demo_key = 'page:' . $key;
			$page_id = $this->find_demo_post_id( 'page', $demo_key );
			$postarr = array(
				'ID'           => $page_id,
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $definition[0],
				'post_name'    => $definition[1],
				'post_content' => $definition[2],
			);
			$saved = wp_insert_post( wp_slash( $postarr ), true );

			if ( is_wp_error( $saved ) ) {
				throw new RuntimeException( $saved->get_error_message() );
			}
			$page_id = absint( $saved );
			update_post_meta( $page_id, self::DEMO_META, '1' );
			update_post_meta( $page_id, self::DEMO_KEY_META, $demo_key );
			update_post_meta( $page_id, self::DEMO_SOURCE_META, 'paper:page-flow' );
			$result[ $key ] = $page_id;
		}

		return $result;
	}

	/** @param array<string, int> $pages Page IDs. */
	private function configure_core_pages( array $pages, bool $force ): void {
		$this->set_page_option( 'woocommerce_shop_page_id', $pages['shop'], $force );
		$this->set_page_option( 'woocommerce_cart_page_id', $pages['cart'], $force );
		$this->set_page_option( 'woocommerce_checkout_page_id', $pages['checkout'], $force );

		$current_front = absint( get_option( 'page_on_front' ) );
		if ( $force || 0 === $current_front || $this->is_demo_post( $current_front ) ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', $pages['home'] );
		}
	}

	/**
	 * @param array<string, int> $pages Page IDs.
	 * @param array<string, int> $categories Category IDs.
	 * @return array{menu_id:int,location:string}
	 */
	private function seed_menu( array $pages, array $categories, bool $force ): array {
		$menu_key = 'menu:primary';
		$terms = get_terms(
			array(
				'taxonomy' => 'nav_menu',
				'hide_empty' => false,
				'meta_key' => self::DEMO_KEY_META,
				'meta_value' => $menu_key,
				'number' => 1,
			)
		);
		if ( is_wp_error( $terms ) ) {
			throw new RuntimeException( $terms->get_error_message() );
		}

		if ( ! empty( $terms ) && $terms[0] instanceof WP_Term ) {
			$menu_id = $terms[0]->term_id;
		} else {
			$created = wp_create_nav_menu( 'Автозакуп — основное демо-меню' );
			if ( is_wp_error( $created ) ) {
				throw new RuntimeException( $created->get_error_message() );
			}
			$menu_id = absint( $created );
			update_term_meta( $menu_id, self::DEMO_META, '1' );
			update_term_meta( $menu_id, self::DEMO_KEY_META, $menu_key );
		}

		$shop_url = get_permalink( $pages['shop'] ) ?: home_url( '/' );
		$oils_url = get_term_link( $categories['oils'], 'product_cat' );
		$maintenance_url = get_term_link( $categories['filters'], 'product_cat' );
		$items = array(
			'oils' => array( 'Масла и жидкости', is_wp_error( $oils_url ) ? $shop_url : $oils_url ),
			'maintenance' => array( 'Запчасти для ТО', is_wp_error( $maintenance_url ) ? $shop_url : $maintenance_url ),
			'business' => array( 'Для автосервисов', get_permalink( $pages['business'] ) ?: home_url( '/#business' ) ),
		);
		$existing = wp_get_nav_menu_items( $menu_id, array( 'post_status' => 'any' ) );
		$desired_keys = array_map( static fn ( string $key ): string => 'menu-item:' . $key, array_keys( $items ) );

		foreach ( is_array( $existing ) ? $existing : array() as $item ) {
			if ( ! $item instanceof WP_Post || '1' !== get_post_meta( $item->ID, self::DEMO_META, true ) ) {
				continue;
			}
			$item_key = (string) get_post_meta( $item->ID, self::DEMO_KEY_META, true );
			if ( ! in_array( $item_key, $desired_keys, true ) ) {
				wp_delete_post( $item->ID, true );
			}
		}

		foreach ( $items as $key => $definition ) {
			$item_key = 'menu-item:' . $key;
			$item_id = 0;
			foreach ( is_array( $existing ) ? $existing : array() as $item ) {
				if ( $item instanceof WP_Post && $item_key === get_post_meta( $item->ID, self::DEMO_KEY_META, true ) ) {
					$item_id = $item->ID;
					break;
				}
			}

			$saved = wp_update_nav_menu_item(
				$menu_id,
				$item_id,
				array(
					'menu-item-title' => $definition[0],
					'menu-item-url' => $definition[1],
					'menu-item-type' => 'custom',
					'menu-item-status' => 'publish',
				)
			);
			if ( is_wp_error( $saved ) ) {
				throw new RuntimeException( $saved->get_error_message() );
			}
			update_post_meta( absint( $saved ), self::DEMO_META, '1' );
			update_post_meta( absint( $saved ), self::DEMO_KEY_META, $item_key );
		}

		$location = $this->assign_menu_location( $menu_id, $force );
		return array( 'menu_id' => $menu_id, 'location' => $location );
	}

	/**
	 * @param array<string, int> $categories Category IDs.
	 * @param array<string, int> $products   Product IDs.
	 * @param array<string, int> $pages      Page IDs.
	 * @param array<string, int> $media      Attachment IDs.
	 */
	private function update_homepage_settings( array $categories, array $products, array $pages, array $media, bool $force ): void {
		$raw = get_option( Settings::OPTION_NAME, null );
		$is_new = ! is_array( $raw );
		$settings = $force ? Settings::defaults() : Settings::get();
		$category_ids = array_values( $categories );
		$popular_product_ids = array_values(
			array_filter(
				array_map(
					static fn ( string $key ): int => absint( $products[ $key ] ?? 0 ),
					array( 'oil-filter', 'cabin-filter', 'engine-oil', 'spark-plug', 'radiator' )
				)
			)
		);
		$stock_product_ids = array_values(
			array_filter(
				array_map(
					static fn ( string $key ): int => absint( $products[ $key ] ?? 0 ),
					array( 'brake-pads', 'brake-disc', 'timing-kit', 'shock', 'alternator' )
				)
			)
		);

		if ( $force || $is_new || empty( $settings['category_ids'] ) || $this->all_demo_terms( $settings['category_ids'] ) ) {
			$settings['category_ids'] = $category_ids;
		}
		if ( $force || $is_new || empty( $settings['popular_product_ids'] ) || $this->all_demo_posts( $settings['popular_product_ids'] ) ) {
			$settings['popular_product_ids'] = $popular_product_ids;
		}
		if ( $force || $is_new || empty( $settings['stock_product_ids'] ) || $this->all_demo_posts( $settings['stock_product_ids'] ) ) {
			$settings['stock_product_ids'] = $stock_product_ids;
		}

		$defaults = Settings::defaults();
		$link_map = array(
			'hero_primary_url' => 'shop',
			'hero_secondary_url' => 'delivery',
			'vin_button_url' => 'vin',
			'b2b_button_url' => 'business',
		);
		foreach ( $link_map as $setting_key => $page_key ) {
			if ( $force || $is_new || empty( $settings[ $setting_key ] ) || $defaults[ $setting_key ] === $settings[ $setting_key ] ) {
				$settings[ $setting_key ] = get_permalink( $pages[ $page_key ] ) ?: $defaults[ $setting_key ];
			}
		}
		if ( $force || $is_new || empty( $settings['hero_image_id'] ) || $this->is_demo_post( absint( $settings['hero_image_id'] ) ) ) {
			$settings['hero_image_id'] = absint( $media['hero-oil.webp'] ?? 0 );
		}

		update_option( Settings::OPTION_NAME, $settings, false );
	}

	/** @return array{available:bool,activated:bool,stylesheet:string} */
	private function maybe_activate_theme(): array {
		$theme = wp_get_theme( 'avtozakup' );
		if ( ! $theme->exists() ) {
			return array( 'available' => false, 'activated' => false, 'stylesheet' => get_stylesheet() );
		}

		$activated = false;
		if ( 'avtozakup' !== get_stylesheet() ) {
			switch_theme( 'avtozakup' );
			$activated = true;
		}

		return array( 'available' => true, 'activated' => $activated, 'stylesheet' => 'avtozakup' );
	}

	private function set_page_option( string $option, int $page_id, bool $force ): void {
		$current = absint( get_option( $option ) );
		if ( $force || 0 === $current || ! get_post( $current ) || $this->is_demo_post( $current ) ) {
			update_option( $option, $page_id );
		}
	}

	private function assign_menu_location( int $menu_id, bool $force ): string {
		$registered = get_registered_nav_menus();
		if ( isset( $registered['primary'] ) || 'avtozakup' === get_stylesheet() ) {
			$location = 'primary';
		} elseif ( isset( $registered['menu-1'] ) ) {
			$location = 'menu-1';
		} else {
			$location = (string) array_key_first( $registered );
		}

		if ( '' === $location ) {
			return '';
		}

		$locations = get_theme_mod( 'nav_menu_locations', array() );
		$current = absint( $locations[ $location ] ?? 0 );
		if ( $force || 0 === $current || '1' === get_term_meta( $current, self::DEMO_META, true ) ) {
			$locations[ $location ] = $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
			return $location;
		}

		return '';
	}

	private function find_demo_term( string $demo_key ): ?WP_Term {
		$terms = get_terms(
			array(
				'taxonomy' => 'product_cat',
				'hide_empty' => false,
				'meta_key' => self::DEMO_KEY_META,
				'meta_value' => $demo_key,
				'number' => 1,
			)
		);
		if ( is_wp_error( $terms ) ) {
			throw new RuntimeException( $terms->get_error_message() );
		}
		return ! empty( $terms ) && $terms[0] instanceof WP_Term ? $terms[0] : null;
	}

	private function available_term_slug( string $preferred ): string {
		if ( ! get_term_by( 'slug', $preferred, 'product_cat' ) ) {
			return $preferred;
		}
		$counter = 1;
		do {
			$candidate = 'demo-' . $preferred . ( $counter > 1 ? '-' . $counter : '' );
			++$counter;
		} while ( get_term_by( 'slug', $candidate, 'product_cat' ) );
		return $candidate;
	}

	private function find_demo_post_id( string $post_type, string $demo_key ): int {
		$ids = get_posts(
			array(
				'post_type' => $post_type,
				'post_status' => 'attachment' === $post_type ? 'inherit' : 'any',
				'posts_per_page' => 1,
				'fields' => 'ids',
				'meta_key' => self::DEMO_KEY_META,
				'meta_value' => $demo_key,
				'no_found_rows' => true,
			)
		);
		return empty( $ids ) ? 0 : absint( $ids[0] );
	}

	private function is_demo_post( int $post_id ): bool {
		return $post_id > 0 && '1' === get_post_meta( $post_id, self::DEMO_META, true );
	}

	/** @param array<int, int> $ids Post IDs. */
	private function all_demo_posts( array $ids ): bool {
		return ! empty( $ids ) && count( array_filter( $ids, array( $this, 'is_demo_post' ) ) ) === count( $ids );
	}

	/** @param array<int, int> $ids Term IDs. */
	private function all_demo_terms( array $ids ): bool {
		if ( empty( $ids ) ) {
			return false;
		}
		foreach ( $ids as $id ) {
			if ( '1' !== get_term_meta( absint( $id ), self::DEMO_META, true ) ) {
				return false;
			}
		}
		return true;
	}
}

