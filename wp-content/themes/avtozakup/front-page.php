<?php
/** Canonical homepage (Paper SCR-002). @package Avtozakup */
get_header();
$settings = avtozakup_home_settings();
$categories = avtozakup_home_categories();
$maintenance_products = avtozakup_home_products( 'maintenance_product_ids' );
$stock_products = avtozakup_home_products( 'stock_product_ids' );
$shop_url = avtozakup_wc_page_url( 'shop' );
?>
<main id="primary" class="az-main">
	<section class="az-hero az-container" aria-labelledby="az-hero-title">
		<div class="az-hero__vehicle">
			<h1 id="az-hero-title"><?php avtozakup_heading_lines( (string) $settings['hero_title'], true ); ?></h1>
			<p><?php echo esc_html( (string) $settings['hero_text'] ); ?></p>
			<div class="az-vehicle-picker" aria-describedby="az-vehicle-note">
				<label><span><?php esc_html_e( 'Марка', 'avtozakup' ); ?></span><select disabled><option><?php esc_html_e( 'Выберите марку', 'avtozakup' ); ?></option></select></label>
				<label><span><?php esc_html_e( 'Модель', 'avtozakup' ); ?></span><select disabled><option><?php esc_html_e( 'Выберите модель', 'avtozakup' ); ?></option></select></label>
				<label><span><?php esc_html_e( 'Год выпуска', 'avtozakup' ); ?></span><select disabled><option><?php esc_html_e( 'Выберите год', 'avtozakup' ); ?></option></select></label>
				<label><span><?php esc_html_e( 'Модификация', 'avtozakup' ); ?></span><select disabled><option><?php esc_html_e( 'Выберите модификацию', 'avtozakup' ); ?></option></select></label>
				<button class="az-button" type="button" data-status-dialog="vehicle"><?php esc_html_e( 'Подобрать', 'avtozakup' ); ?></button>
			</div>
			<a class="az-hero__vin" href="#vin-request"><?php echo avtozakup_icon( 'vin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php esc_html_e( 'Не знаете автомобиль? Подбор по VIN', 'avtozakup' ); ?></a>
			<p id="az-vehicle-note" class="screen-reader-text"><?php esc_html_e( 'Каталог применяемости ожидает согласования источника данных.', 'avtozakup' ); ?></p>
		</div>
		<div class="az-hero__promo">
			<div class="az-hero__promo-copy">
				<h2><?php avtozakup_heading_lines( (string) $settings['oil_title'] ); ?></h2>
				<p><?php echo esc_html( (string) $settings['oil_text'] ); ?></p>
				<a class="az-button" href="<?php echo esc_url( (string) $settings['oil_button_url'] ); ?>"><?php echo esc_html( (string) $settings['oil_button_label'] ); ?></a>
			</div>
			<img src="<?php echo esc_url( (string) $settings['oil_image'] ); ?>" alt="" width="310" height="330" fetchpriority="high">
			<div class="az-slider-dots" aria-hidden="true"><b></b><i></i><i></i><i></i></div>
		</div>
	</section>

	<section class="az-benefits az-container" aria-label="<?php esc_attr_e( 'Преимущества магазина', 'avtozakup' ); ?>">
		<div><?php echo avtozakup_icon( 'box' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Свой склад', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Товары в наличии', 'avtozakup' ); ?></span></p></div>
		<div><?php echo avtozakup_icon( 'swap' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Выбор предложений', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Разные цены и сроки', 'avtozakup' ); ?></span></p></div>
		<div><?php echo avtozakup_icon( 'shield' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Гарантия и качество', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Проверенные поставщики', 'avtozakup' ); ?></span></p></div>
		<div><?php echo avtozakup_icon( 'headset' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Поможем подобрать', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'По автомобилю и VIN', 'avtozakup' ); ?></span></p></div>
	</section>

	<section id="catalog" class="az-section az-container" aria-labelledby="az-catalog-title">
		<div class="az-section__heading"><h2 id="az-catalog-title"><?php esc_html_e( 'Каталог', 'avtozakup' ); ?></h2><a href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Все категории', 'avtozakup' ); ?><?php echo avtozakup_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></a></div>
		<div class="az-category-grid">
			<?php foreach ( $categories as $index => $category ) : ?>
				<?php $term_link = get_term_link( $category ); ?>
				<a class="az-category-card" href="<?php echo esc_url( is_wp_error( $term_link ) ? $shop_url : $term_link ); ?>">
					<?php echo avtozakup_category_illustration( (int) $index ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span><?php echo esc_html( $category->name ); ?></span>
				</a>
			<?php endforeach; ?>
			<?php if ( ! $categories ) : ?>
				<p class="az-empty-state"><?php esc_html_e( 'Категории появятся после запуска безопасного демо-импорта.', 'avtozakup' ); ?></p>
			<?php endif; ?>
		</div>
	</section>

	<section class="az-section az-products az-container" aria-labelledby="az-maintenance-title">
		<div class="az-section__heading"><h2 id="az-maintenance-title"><?php esc_html_e( 'Расходники для планового ТО', 'avtozakup' ); ?></h2><a href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Все товары', 'avtozakup' ); ?><?php echo avtozakup_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></a></div>
		<p class="az-demo-note"><?php esc_html_e( 'Демонстрационная подборка · цены и наличие не являются коммерческим предложением', 'avtozakup' ); ?></p>
		<div class="az-product-filters" aria-label="<?php esc_attr_e( 'Фильтры подборки', 'avtozakup' ); ?>"><span class="is-active"><?php esc_html_e( 'Все', 'avtozakup' ); ?></span><span><?php esc_html_e( 'Фильтры', 'avtozakup' ); ?></span><span><?php esc_html_e( 'Масла', 'avtozakup' ); ?></span><span><?php esc_html_e( 'Свечи', 'avtozakup' ); ?></span></div>
		<div class="az-product-row">
			<?php foreach ( $maintenance_products as $product ) : avtozakup_product_card( $product ); endforeach; ?>
			<?php if ( ! $maintenance_products ) : ?><p class="az-empty-state"><?php esc_html_e( 'Товары появятся после подключения WooCommerce и демо-импорта.', 'avtozakup' ); ?></p><?php endif; ?>
		</div>
	</section>

	<section class="az-section az-products az-container" aria-labelledby="az-stock-title">
		<div class="az-section__heading"><h2 id="az-stock-title"><?php esc_html_e( 'В наличии на нашем складе', 'avtozakup' ); ?></h2><a href="<?php echo esc_url( $shop_url ); ?>"><?php esc_html_e( 'Все товары', 'avtozakup' ); ?><?php echo avtozakup_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></a></div>
		<p class="az-demo-note"><?php esc_html_e( 'Демонстрационная подборка · фактический склад будет определён после DEC-001/DEC-002', 'avtozakup' ); ?></p>
		<div class="az-product-row">
			<?php foreach ( $stock_products as $product ) : avtozakup_product_card( $product ); endforeach; ?>
			<?php if ( ! $stock_products ) : ?><p class="az-empty-state"><?php esc_html_e( 'Складская подборка появится после демо-импорта.', 'avtozakup' ); ?></p><?php endif; ?>
		</div>
	</section>

	<section id="vin-request" class="az-vin az-container" aria-labelledby="az-vin-title">
		<div class="az-vin__visual" style="--az-vin-image:url('<?php echo esc_url( (string) $settings['vin_image'] ); ?>')">
			<div><span><?php esc_html_e( 'ПОДБОР ПО VIN', 'avtozakup' ); ?></span><h2><?php esc_html_e( 'Нужна помощь', 'avtozakup' ); ?><br><?php esc_html_e( 'с подбором?', 'avtozakup' ); ?></h2><p><?php esc_html_e( 'Поможем найти нужную деталь по VIN и вашему описанию.', 'avtozakup' ); ?></p></div>
		</div>
		<div class="az-vin__form">
			<h2 id="az-vin-title"><?php echo esc_html( (string) $settings['vin_title'] ); ?></h2>
			<p><?php echo esc_html( (string) $settings['vin_text'] ); ?></p>
			<label for="az-vin"><?php esc_html_e( 'VIN автомобиля', 'avtozakup' ); ?></label><input id="az-vin" type="text" maxlength="17" placeholder="<?php esc_attr_e( 'Введите VIN (17 символов)', 'avtozakup' ); ?>" autocomplete="off">
			<label for="az-part"><?php esc_html_e( 'Какая деталь нужна', 'avtozakup' ); ?></label><input id="az-part" type="text" placeholder="<?php esc_attr_e( 'Например, передние тормозные колодки', 'avtozakup' ); ?>" autocomplete="off">
			<div class="az-vin__actions"><button class="az-button" type="button" data-status-dialog="vin"><?php esc_html_e( 'Продолжить →', 'avtozakup' ); ?></button><span><?php esc_html_e( 'Контакты и согласие будут запрошены на согласованном шаге', 'avtozakup' ); ?></span></div>
		</div>
	</section>

	<section id="business" class="az-business az-container" aria-labelledby="az-business-title">
		<div class="az-business__copy"><span><?php echo esc_html( (string) $settings['b2b_eyebrow'] ); ?></span><h2 id="az-business-title"><?php avtozakup_heading_lines( (string) $settings['b2b_title'] ); ?></h2><p><?php echo esc_html( (string) $settings['b2b_text'] ); ?></p><button class="az-button" type="button" data-status-dialog="b2b"><?php echo esc_html( (string) $settings['b2b_button_label'] ); ?></button></div>
		<div class="az-business__benefits"><div><?php echo avtozakup_icon( 'box' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Свой склад и поставщики', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Варианты получения под ваш запрос', 'avtozakup' ); ?></span></p></div><div><?php echo avtozakup_icon( 'swap' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Подбор аналогов', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Помогаем сравнить предложения', 'avtozakup' ); ?></span></p></div><div><?php echo avtozakup_icon( 'headset' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><p><strong><?php esc_html_e( 'Работа с автосервисами', 'avtozakup' ); ?></strong><span><?php esc_html_e( 'Персональное обсуждение условий', 'avtozakup' ); ?></span></p></div></div>
	</section>

	<section class="az-pickup az-container" aria-labelledby="az-pickup-title">
		<div class="az-pickup__copy"><h2 id="az-pickup-title"><?php avtozakup_heading_lines( (string) $settings['pickup_title'] ); ?></h2><p><?php echo esc_html( (string) $settings['pickup_text'] ); ?></p><small><?php esc_html_e( 'Адреса и условия получения появятся после открытия магазина.', 'avtozakup' ); ?></small><a class="az-button az-button--outline" href="<?php echo esc_url( home_url( '/delivery/' ) ); ?>"><?php esc_html_e( 'О доставке →', 'avtozakup' ); ?></a></div>
		<div class="az-map" aria-label="<?php esc_attr_e( 'Схема будущего пункта выдачи', 'avtozakup' ); ?>"><div class="az-map__blocks" aria-hidden="true"><?php for ( $i = 0; $i < 12; $i++ ) : ?><i></i><?php endfor; ?></div><span><?php echo avtozakup_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><b><?php esc_html_e( 'пункт выдачи', 'avtozakup' ); ?></b></span><svg viewBox="0 0 300 130" aria-hidden="true"><path d="M165 35v48h70v35"/></svg></div>
	</section>
</main>
<?php get_footer(); ?>

