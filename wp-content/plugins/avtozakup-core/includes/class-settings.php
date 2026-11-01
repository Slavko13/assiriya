<?php
/**
 * Homepage settings registered through the WordPress Settings API.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

use WP_Post;
use WP_Term;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Settings {
	public const OPTION_NAME = 'avtozakup_homepage';
	public const OPTION_GROUP = 'avtozakup_homepage_group';
	public const PAGE_SLUG = 'avtozakup';

	/** @var array<string, array<string, string>> */
	private array $fields = array();

	public function __construct() {
		$this->fields = $this->build_fields();
	}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Defaults intentionally contain presentation content only. They do not
	 * encode stock, fitment, supplier, reservation, VIN or B2B decisions.
	 *
	 * @return array<string, mixed>
	 */
	public static function defaults(): array {
		return array(
			'contact_phone'         => '+7 (800) 000-00-00',
			'contact_email'         => 'info@example.test',
			'hero_eyebrow'          => 'Автозапчасти для вашего автомобиля',
			'hero_title'            => 'НАЙДИТЕ ЗАПЧАСТИ|ПО СВОЕМУ АВТОМОБИЛЮ',
			'hero_text'             => 'Укажите автомобиль — покажем подходящие категории и детали.',
			'hero_image_id'         => 0,
			'hero_primary_label'    => 'Перейти в каталог',
			'hero_primary_url'      => '/shop/',
			'hero_secondary_label'  => 'Условия доставки',
			'hero_secondary_url'    => '/delivery/',
			'catalog_title'         => 'Каталог автозапчастей',
			'catalog_text'          => 'Основные разделы каталога',
			'category_ids'          => array(),
			'popular_title'         => 'Расходники для планового ТО',
			'popular_text'          => 'Демонстрационная подборка товаров WooCommerce',
			'popular_product_ids'   => array(),
			'stock_title'           => 'В наличии на нашем складе',
			'stock_text'            => 'Наличие в первой итерации носит демонстрационный характер',
			'stock_product_ids'     => array(),
			'vin_title'             => 'Подберём нужную деталь',
			'vin_text'              => 'Подбор по VIN появится после подключения подтверждённого процесса обработки заявок.',
			'vin_button_label'      => 'Подробнее о подборе',
			'vin_button_url'        => '/vin-request/',
			'b2b_title'             => 'Вы занимаетесь ремонтом.|Мы помогаем с запчастями.',
			'b2b_text'              => 'B2B-условия будут доступны после согласования проверки организаций и правил ценообразования.',
			'b2b_button_label'      => 'Подробнее для бизнеса',
			'b2b_button_url'        => '/business/',
			'b2b_image_id'          => 0,
			'delivery_title'        => 'Заберите заказ|по пути на сервис',
			'delivery_text'         => 'Самовывоз и доставка будут рассчитаны по подтверждённым условиям на этапе оформления заказа.',
		);
	}

	/**
	 * Read a complete, forward-compatible settings array.
	 *
	 * @return array<string, mixed>
	 */
	public static function get(): array {
		$value = get_option( self::OPTION_NAME, array() );

		if ( ! is_array( $value ) ) {
			$value = array();
		}

		$settings = wp_parse_args( $value, self::defaults() );
		$settings['category_ids'] = self::normalize_id_list( $settings['category_ids'] ?? array() );
		$settings['popular_product_ids'] = self::normalize_id_list( $settings['popular_product_ids'] ?? array() );
		$settings['stock_product_ids'] = self::normalize_id_list( $settings['stock_product_ids'] ?? array() );

		return $settings;
	}

	public function register_menu(): void {
		add_menu_page(
			__( 'Главная — Автозакуп', 'avtozakup-core' ),
			__( 'Автозакуп', 'avtozakup-core' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			'dashicons-car',
			56
		);

		add_submenu_page(
			self::PAGE_SLUG,
			__( 'Главная — Автозакуп', 'avtozakup-core' ),
			__( 'Главная', 'avtozakup-core' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	public function register_settings(): void {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'default'           => self::defaults(),
				'sanitize_callback' => array( $this, 'sanitize' ),
			)
		);

		$sections = array(
			'contacts' => array( 'contacts_section', __( 'Контакты', 'avtozakup-core' ) ),
			'hero'     => array( 'hero_section', __( 'Первый экран', 'avtozakup-core' ) ),
			'catalog'  => array( 'catalog_section', __( 'Каталог', 'avtozakup-core' ) ),
			'popular'  => array( 'popular_section', __( 'Подборка для ТО', 'avtozakup-core' ) ),
			'stock'    => array( 'stock_section', __( 'Подборка со склада', 'avtozakup-core' ) ),
			'vin'      => array( 'vin_section', __( 'Подбор по VIN', 'avtozakup-core' ) ),
			'b2b'      => array( 'b2b_section', __( 'B2B-баннер', 'avtozakup-core' ) ),
			'delivery' => array( 'delivery_section', __( 'Получение заказа', 'avtozakup-core' ) ),
		);

		foreach ( $sections as $section ) {
			add_settings_section( $section[0], $section[1], '__return_empty_string', self::PAGE_SLUG );
		}

		foreach ( $this->fields as $key => $field ) {
			add_settings_field(
				$key,
				$field['label'],
				array( $this, 'render_field' ),
				self::PAGE_SLUG,
				$field['section'] . '_section',
				array(
					'key'         => $key,
					'type'        => $field['type'],
					'description' => $field['description'],
				)
			);
		}
	}

	/**
	 * Settings API sanitizer. options.php verifies the Settings API nonce and
	 * the option-page capability before this callback is invoked.
	 *
	 * @param mixed $input Raw option payload.
	 * @return array<string, mixed>
	 */
	public function sanitize( $input ): array {
		$defaults = self::defaults();
		$clean = array();
		$input = is_array( $input ) ? $input : array();

		foreach ( $this->fields as $key => $field ) {
			$value = $input[ $key ] ?? null;

			switch ( $field['type'] ) {
				case 'textarea':
					$clean[ $key ] = sanitize_textarea_field( is_scalar( $value ) ? (string) $value : '' );
					break;
				case 'url':
					$clean[ $key ] = esc_url_raw( is_scalar( $value ) ? (string) $value : '' );
					break;
				case 'email':
					$clean[ $key ] = sanitize_email( is_scalar( $value ) ? (string) $value : '' );
					break;
				case 'media':
					$attachment_id = absint( $value );
					$clean[ $key ] = $attachment_id > 0 && wp_attachment_is_image( $attachment_id ) ? $attachment_id : 0;
					break;
				case 'categories':
					$clean[ $key ] = $this->sanitize_category_ids( $value );
					break;
				case 'products':
					$clean[ $key ] = $this->sanitize_product_ids( $value );
					break;
				default:
					$clean[ $key ] = sanitize_text_field( is_scalar( $value ) ? (string) $value : '' );
					break;
			}
		}

		return wp_parse_args( $clean, $defaults );
	}

	/**
	 * @param array<string, string> $args Field callback arguments.
	 */
	public function render_field( array $args ): void {
		$key = $args['key'];
		$type = $args['type'];
		$settings = self::get();
		$value = $settings[ $key ] ?? '';
		$name = self::OPTION_NAME . '[' . $key . ']';

		switch ( $type ) {
			case 'textarea':
				printf(
					'<textarea class="large-text" rows="4" id="%1$s" name="%2$s">%3$s</textarea>',
					esc_attr( $key ),
					esc_attr( $name ),
					esc_textarea( (string) $value )
				);
				break;
			case 'url':
				printf(
					'<input class="regular-text code" type="text" inputmode="url" id="%1$s" name="%2$s" value="%3$s" placeholder="https://example.com/ или /page/">',
					esc_attr( $key ),
					esc_attr( $name ),
					esc_attr( (string) $value )
				);
				break;
			case 'email':
				printf(
					'<input class="regular-text" type="email" id="%1$s" name="%2$s" value="%3$s">',
					esc_attr( $key ),
					esc_attr( $name ),
					esc_attr( (string) $value )
				);
				break;
			case 'media':
				$this->render_media_field( $key, $name, absint( $value ) );
				break;
			case 'categories':
				$this->render_category_field( $key, $name, self::normalize_id_list( $value ) );
				break;
			case 'products':
				$this->render_product_field( $key, $name, self::normalize_id_list( $value ) );
				break;
			default:
				printf(
					'<input class="regular-text" type="text" id="%1$s" name="%2$s" value="%3$s">',
					esc_attr( $key ),
					esc_attr( $name ),
					esc_attr( (string) $value )
				);
				break;
		}

		if ( '' !== $args['description'] ) {
			printf( '<p class="description">%s</p>', esc_html( $args['description'] ) );
		}
	}

	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die(
				esc_html__( 'У вас нет права изменять настройки магазина.', 'avtozakup-core' ),
				'',
				array( 'response' => 403 )
			);
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'Автозакуп — главная страница', 'avtozakup-core' ); ?></h1>
			<p><?php echo esc_html__( 'Здесь хранится редактируемый контент главной. Товары и категории редактируются через WooCommerce.', 'avtozakup-core' ); ?></p>
			<?php settings_errors( self::OPTION_NAME ); ?>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::OPTION_GROUP );
				do_settings_sections( self::PAGE_SLUG );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	public function enqueue_assets( string $hook_suffix ): void {
		if ( 'toplevel_page_' . self::PAGE_SLUG !== $hook_suffix || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_script(
			'avtozakup-core-settings',
			AVTOZAKUP_CORE_URL . 'assets/js/admin-settings.js',
			array( 'jquery' ),
			AVTOZAKUP_CORE_VERSION,
			true
		);
		wp_localize_script(
			'avtozakup-core-settings',
			'avtozakupSettingsL10n',
			array(
				'chooseImage' => __( 'Выбрать изображение', 'avtozakup-core' ),
				'useImage'    => __( 'Использовать изображение', 'avtozakup-core' ),
			)
		);
	}

	/**
	 * @return array<string, array<string, string>>
	 */
	private function build_fields(): array {
		return array(
			'contact_phone'        => $this->field( 'contacts', 'text', 'Телефон' ),
			'contact_email'        => $this->field( 'contacts', 'email', 'Email' ),
			'hero_eyebrow'         => $this->field( 'hero', 'text', 'Надзаголовок' ),
			'hero_title'           => $this->field( 'hero', 'text', 'Заголовок' ),
			'hero_text'            => $this->field( 'hero', 'textarea', 'Описание' ),
			'hero_image_id'        => $this->field( 'hero', 'media', 'Изображение', 'Выберите оптимизированное изображение из медиатеки.' ),
			'hero_primary_label'   => $this->field( 'hero', 'text', 'Основная кнопка — подпись' ),
			'hero_primary_url'     => $this->field( 'hero', 'url', 'Основная кнопка — ссылка' ),
			'hero_secondary_label' => $this->field( 'hero', 'text', 'Вторая кнопка — подпись' ),
			'hero_secondary_url'   => $this->field( 'hero', 'url', 'Вторая кнопка — ссылка' ),
			'catalog_title'        => $this->field( 'catalog', 'text', 'Заголовок' ),
			'catalog_text'         => $this->field( 'catalog', 'textarea', 'Описание' ),
			'category_ids'         => $this->field( 'catalog', 'categories', 'Категории', 'Можно выбрать несколько категорий.' ),
			'popular_title'        => $this->field( 'popular', 'text', 'Заголовок' ),
			'popular_text'         => $this->field( 'popular', 'textarea', 'Описание' ),
			'popular_product_ids'  => $this->field( 'popular', 'products', 'Товары', 'Показываются только выбранные записи WooCommerce.' ),
			'stock_title'          => $this->field( 'stock', 'text', 'Заголовок' ),
			'stock_text'           => $this->field( 'stock', 'textarea', 'Описание' ),
			'stock_product_ids'    => $this->field( 'stock', 'products', 'Товары', 'Выбор не подтверждает фактический складской остаток.' ),
			'vin_title'            => $this->field( 'vin', 'text', 'Заголовок' ),
			'vin_text'             => $this->field( 'vin', 'textarea', 'Описание' ),
			'vin_button_label'     => $this->field( 'vin', 'text', 'Кнопка — подпись' ),
			'vin_button_url'       => $this->field( 'vin', 'url', 'Кнопка — ссылка', 'Плагин не принимает VIN-заявки без подключённого процесса.' ),
			'b2b_title'            => $this->field( 'b2b', 'text', 'Заголовок' ),
			'b2b_text'             => $this->field( 'b2b', 'textarea', 'Описание' ),
			'b2b_button_label'     => $this->field( 'b2b', 'text', 'Кнопка — подпись' ),
			'b2b_button_url'       => $this->field( 'b2b', 'url', 'Кнопка — ссылка', 'Плагин не активирует B2B-условия или цены.' ),
			'b2b_image_id'         => $this->field( 'b2b', 'media', 'Фоновое изображение' ),
			'delivery_title'       => $this->field( 'delivery', 'text', 'Заголовок' ),
			'delivery_text'        => $this->field( 'delivery', 'textarea', 'Описание' ),
		);
	}

	/**
	 * @return array<string, string>
	 */
	private function field( string $section, string $type, string $label, string $description = '' ): array {
		return array(
			'section'     => $section,
			'type'        => $type,
			'label'       => $label,
			'description' => $description,
		);
	}

	private function render_media_field( string $key, string $name, int $attachment_id ): void {
		$preview = $attachment_id > 0 ? wp_get_attachment_image_url( $attachment_id, 'medium' ) : false;
		$style = $preview ? 'max-width:240px;height:auto;display:block;margin:0 0 10px;' : 'display:none;max-width:240px;height:auto;margin:0 0 10px;';
		?>
		<div class="avtozakup-media-field">
			<input class="avtozakup-media-id" type="hidden" id="<?php echo esc_attr( $key ); ?>" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( (string) $attachment_id ); ?>">
			<img class="avtozakup-media-preview" src="<?php echo esc_url( $preview ?: '' ); ?>" alt="" style="<?php echo esc_attr( $style ); ?>">
			<button class="button avtozakup-media-choose" type="button"><?php echo esc_html__( 'Выбрать изображение', 'avtozakup-core' ); ?></button>
			<button class="button-link-delete avtozakup-media-remove" type="button" <?php disabled( 0, $attachment_id ); ?>><?php echo esc_html__( 'Удалить', 'avtozakup-core' ); ?></button>
		</div>
		<?php
	}

	/**
	 * @param array<int, int> $selected Selected term IDs.
	 */
	private function render_category_field( string $key, string $name, array $selected ): void {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			echo '<p>' . esc_html__( 'Активируйте WooCommerce, чтобы выбирать категории.', 'avtozakup-core' ) . '</p>';
			return;
		}

		$terms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) );
		if ( is_wp_error( $terms ) ) {
			echo '<p>' . esc_html__( 'Не удалось загрузить категории.', 'avtozakup-core' ) . '</p>';
			return;
		}

		printf( '<select class="regular-text" id="%1$s" name="%2$s[]" multiple size="8">', esc_attr( $key ), esc_attr( $name ) );
		foreach ( $terms as $term ) {
			if ( ! $term instanceof WP_Term ) {
				continue;
			}
			printf(
				'<option value="%1$d" %2$s>%3$s</option>',
				$term->term_id,
				selected( in_array( $term->term_id, $selected, true ), true, false ),
				esc_html( sprintf( '%s (#%d)', $term->name, $term->term_id ) )
			);
		}
		echo '</select>';
	}

	/**
	 * @param array<int, int> $selected Selected product IDs.
	 */
	private function render_product_field( string $key, string $name, array $selected ): void {
		if ( ! post_type_exists( 'product' ) ) {
			echo '<p>' . esc_html__( 'Активируйте WooCommerce, чтобы выбирать товары.', 'avtozakup-core' ) . '</p>';
			return;
		}

		$product_ids = get_posts(
			array(
				'post_type'              => 'product',
				'post_status'            => array( 'publish', 'draft', 'private' ),
				'posts_per_page'         => 200,
				'orderby'                => 'title',
				'order'                  => 'ASC',
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$product_ids = array_values( array_unique( array_merge( $selected, array_map( 'absint', $product_ids ) ) ) );

		printf( '<select class="regular-text" id="%1$s" name="%2$s[]" multiple size="10">', esc_attr( $key ), esc_attr( $name ) );
		foreach ( $product_ids as $product_id ) {
			$product = get_post( $product_id );
			if ( ! $product instanceof WP_Post || 'product' !== $product->post_type ) {
				continue;
			}
			printf(
				'<option value="%1$d" %2$s>%3$s</option>',
				$product_id,
				selected( in_array( $product_id, $selected, true ), true, false ),
				esc_html( sprintf( '%s (#%d)', $product->post_title, $product_id ) )
			);
		}
		echo '</select>';
	}

	/**
	 * @param mixed $value Raw IDs.
	 * @return array<int, int>
	 */
	private function sanitize_category_ids( $value ): array {
		$ids = self::normalize_id_list( $value );
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return array();
		}

		return array_values(
			array_filter(
				$ids,
				static fn ( int $term_id ): bool => term_exists( $term_id, 'product_cat' ) !== null
			)
		);
	}

	/**
	 * @param mixed $value Raw IDs.
	 * @return array<int, int>
	 */
	private function sanitize_product_ids( $value ): array {
		return array_values(
			array_filter(
				self::normalize_id_list( $value ),
				static fn ( int $product_id ): bool => 'product' === get_post_type( $product_id )
			)
		);
	}

	/**
	 * @param mixed $value Raw IDs.
	 * @return array<int, int>
	 */
	private static function normalize_id_list( $value ): array {
		$value = is_array( $value ) ? $value : array();
		$ids = array_map( 'absint', $value );
		$ids = array_filter( $ids );

		return array_values( array_unique( $ids ) );
	}
}

