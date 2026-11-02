<?php
/** Page template. @package Avtozakup */
get_header();
?>
<main id="primary" class="az-content az-container" tabindex="-1">
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class( 'az-entry' ); ?>><h1><?php the_title(); ?></h1><?php the_content(); ?></article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>

