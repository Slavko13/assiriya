<?php
/** Generic fallback. @package Avtozakup */
get_header();
?>
<main id="primary" class="az-content az-container" tabindex="-1">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class( 'az-entry' ); ?>><h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1><?php the_excerpt(); ?></article>
		<?php endwhile; ?>
		<?php the_posts_pagination(); ?>
	<?php else : ?>
		<h1><?php esc_html_e( 'Ничего не найдено', 'avtozakup' ); ?></h1>
	<?php endif; ?>
</main>
<?php get_footer(); ?>

