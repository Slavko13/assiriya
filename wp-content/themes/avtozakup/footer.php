<?php
/** Site footer. @package Avtozakup */
$az_settings = avtozakup_home_settings();
?>
<footer class="az-footer">
	<div class="az-container az-footer__grid">
		<div class="az-footer__brand">
			<a class="az-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>"><span>АВТО</span><strong>ЗАКУП</strong></a>
			<p><?php esc_html_e( 'Интернет-магазин автозапчастей', 'avtozakup' ); ?></p>
			<p><?php esc_html_e( 'Подбор и заказ деталей для автомобиля', 'avtozakup' ); ?></p>
		</div>
		<nav aria-label="<?php esc_attr_e( 'Покупателям', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Покупателям', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_buyers', 'container' => false, 'fallback_cb' => 'avtozakup_footer_buyers_fallback', 'depth' => 1 ) ); ?>
		</nav>
		<nav aria-label="<?php esc_attr_e( 'Автосервисам', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Автосервисам', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_business', 'container' => false, 'fallback_cb' => 'avtozakup_footer_business_fallback', 'depth' => 1 ) ); ?>
		</nav>
		<nav aria-label="<?php esc_attr_e( 'Информация', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Информация', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_info', 'container' => false, 'fallback_cb' => 'avtozakup_footer_info_fallback', 'depth' => 1 ) ); ?>
		</nav>
	</div>
	<div class="az-container az-footer__bottom">
		<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php esc_html_e( 'АВТОЗАКУП · Демонстрационный MVP', 'avtozakup' ); ?></span>
		<div><a href="<?php echo esc_url( home_url( '/offer/' ) ); ?>"><?php esc_html_e( 'Публичная оферта', 'avtozakup' ); ?></a><a href="<?php echo esc_url( get_privacy_policy_url() ?: home_url( '/privacy/' ) ); ?>"><?php esc_html_e( 'Персональные данные', 'avtozakup' ); ?></a></div>
	</div>
</footer>

<dialog class="az-dialog" data-contact-dialog aria-labelledby="az-contact-title">
	<form method="dialog">
		<button class="az-dialog__close" value="close" aria-label="<?php esc_attr_e( 'Закрыть', 'avtozakup' ); ?>">×</button>
		<p class="az-dialog__eyebrow"><?php esc_html_e( 'Помощь с подбором', 'avtozakup' ); ?></p>
		<h2 id="az-contact-title"><?php esc_html_e( 'Связаться с нами', 'avtozakup' ); ?></h2>
		<p><?php esc_html_e( 'Ежедневно с 9:00 до 20:00', 'avtozakup' ); ?></p>
		<a class="az-dialog__contact" href="tel:<?php echo esc_attr( preg_replace( '/[^+\d]/', '', (string) $az_settings['contact_phone'] ) ); ?>"><?php echo esc_html( (string) $az_settings['contact_phone'] ); ?></a>
		<a class="az-dialog__contact" href="mailto:<?php echo esc_attr( (string) $az_settings['contact_email'] ); ?>"><?php echo esc_html( (string) $az_settings['contact_email'] ); ?></a>
		<p class="az-dialog__note"><?php esc_html_e( 'Контакты редактируются в панели WordPress: Автозакуп → Главная.', 'avtozakup' ); ?></p>
	</form>
</dialog>

<dialog class="az-dialog" data-status-dialog-modal aria-labelledby="az-status-title">
	<form method="dialog">
		<button class="az-dialog__close" value="close" aria-label="<?php esc_attr_e( 'Закрыть', 'avtozakup' ); ?>">×</button>
		<p class="az-dialog__eyebrow"><?php esc_html_e( 'Предварительная функция', 'avtozakup' ); ?></p>
		<h2 id="az-status-title"><?php esc_html_e( 'Сценарий ещё согласуется', 'avtozakup' ); ?></h2>
		<p data-status-copy><?php esc_html_e( 'Этот шаг появится после утверждения бизнес-правил и обработки персональных данных.', 'avtozakup' ); ?></p>
		<button class="az-button" value="close"><?php esc_html_e( 'Понятно', 'avtozakup' ); ?></button>
	</form>
</dialog>
<?php wp_footer(); ?>
</body>
</html>

