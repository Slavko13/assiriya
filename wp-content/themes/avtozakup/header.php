<?php
/** Site header. @package Avtozakup */
$az_settings = avtozakup_home_settings();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="az-skip-link" href="#primary"><?php esc_html_e( 'Перейти к содержимому', 'avtozakup' ); ?></a>
<header class="az-header" data-header>
	<div class="az-topbar">
		<div class="az-container az-topbar__inner">
			<button class="az-city" type="button" data-status-dialog="delivery" aria-haspopup="dialog">
				<?php echo avtozakup_icon( 'pin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span><?php esc_html_e( 'Выбрать город', 'avtozakup' ); ?></span>
				<?php echo avtozakup_icon( 'chevron' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</button>
			<nav class="az-service-nav" aria-label="<?php esc_attr_e( 'Служебная навигация', 'avtozakup' ); ?>">
				<a href="<?php echo esc_url( home_url( '/delivery/' ) ); ?>"><?php esc_html_e( 'Доставка и оплата', 'avtozakup' ); ?></a>
				<a href="<?php echo esc_url( home_url( '/returns/' ) ); ?>"><?php esc_html_e( 'Гарантия и возврат', 'avtozakup' ); ?></a>
				<a href="<?php echo esc_url( home_url( '/about/' ) ); ?>"><?php esc_html_e( 'О магазине', 'avtozakup' ); ?></a>
				<button type="button" data-contact-open aria-haspopup="dialog"><?php esc_html_e( 'Контакты', 'avtozakup' ); ?></button>
				<span class="az-service-nav__hours"><?php esc_html_e( 'Ежедневно 9:00–20:00', 'avtozakup' ); ?></span>
			</nav>
		</div>
	</div>
	<div class="az-mainbar">
		<div class="az-container az-mainbar__inner">
			<a class="az-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'АВТОЗАКУП — главная', 'avtozakup' ); ?>">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<span>АВТО</span><strong>ЗАКУП</strong>
				<?php endif; ?>
			</a>
			<a class="az-catalog-button" href="<?php echo esc_url( avtozakup_wc_page_url( 'shop' ) ); ?>" aria-label="<?php esc_attr_e( 'Каталог товаров', 'avtozakup' ); ?>"><?php echo avtozakup_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php esc_html_e( 'Каталог товаров', 'avtozakup' ); ?></span></a>
			<form class="az-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<label class="screen-reader-text" for="az-product-search"><?php esc_html_e( 'Поиск товаров', 'avtozakup' ); ?></label>
				<span class="az-search__type"><?php esc_html_e( 'По товарам', 'avtozakup' ); ?> <?php echo avtozakup_icon( 'chevron' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<input id="az-product-search" type="search" name="s" placeholder="<?php esc_attr_e( 'Введите запрос', 'avtozakup' ); ?>" value="<?php echo esc_attr( get_search_query( false ) ); ?>">
				<input type="hidden" name="post_type" value="product">
				<button type="submit" aria-label="<?php esc_attr_e( 'Найти', 'avtozakup' ); ?>"><?php echo avtozakup_icon( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
			</form>
			<div class="az-account-actions">
				<a href="<?php echo esc_url( avtozakup_wc_page_url( 'myaccount' ) ); ?>"><?php echo avtozakup_icon( 'user' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php esc_html_e( 'Войти', 'avtozakup' ); ?></span></a>
				<a class="az-cart-link" href="<?php echo esc_url( avtozakup_wc_page_url( 'cart' ) ); ?>"><?php echo avtozakup_icon( 'cart' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></span><b><?php echo class_exists( 'WooCommerce' ) && WC()->cart ? esc_html( (string) WC()->cart->get_cart_contents_count() ) : '0'; ?></b></a>
			</div>
			<button class="az-mobile-toggle" type="button" aria-expanded="false" aria-controls="az-primary-nav" data-nav-toggle><?php echo avtozakup_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><span class="screen-reader-text"><?php esc_html_e( 'Открыть меню', 'avtozakup' ); ?></span></button>
		</div>
	</div>
	<div class="az-navrow" id="az-primary-nav" data-nav-panel>
		<div class="az-container az-navrow__inner">
			<div class="az-navrow__primary">
				<a class="az-nav-cta" href="<?php echo esc_url( home_url( '/vehicle/' ) ); ?>"><?php echo avtozakup_icon( 'car' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php esc_html_e( 'Выбрать автомобиль', 'avtozakup' ); ?></a>
				<a class="az-nav-cta az-nav-cta--quiet" href="#vin-request"><?php echo avtozakup_icon( 'vin' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php esc_html_e( 'Подбор по VIN', 'avtozakup' ); ?></a>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container' => false,
						'menu_class' => 'az-primary-menu',
						'fallback_cb' => 'avtozakup_primary_menu_fallback',
						'depth' => 1,
					)
				);
				?>
			</div>
			<button class="az-contact-link" type="button" data-contact-open aria-haspopup="dialog"><?php echo avtozakup_icon( 'headset' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php esc_html_e( 'Связаться с нами', 'avtozakup' ); ?></button>
		</div>
	</div>
</header>

