<?php
/**
 * Uninstall handler.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove plugin-owned options. Demo content is retained by default because it
 * is editorial content and silent deletion would be surprising. Define
 * AVTOZAKUP_REMOVE_DEMO_DATA_ON_UNINSTALL=true before uninstalling to remove
 * only entities explicitly marked with _avtozakup_demo=1.
 */
function avtozakup_core_uninstall_site(): void {
	delete_option( 'avtozakup_homepage' );
	delete_option( 'avtozakup_demo_manifest' );

	if ( ! defined( 'AVTOZAKUP_REMOVE_DEMO_DATA_ON_UNINSTALL' ) || ! AVTOZAKUP_REMOVE_DEMO_DATA_ON_UNINSTALL ) {
		return;
	}

	foreach ( array( 'product', 'page', 'nav_menu_item', 'attachment' ) as $post_type ) {
		$ids = get_posts(
			array(
				'post_type' => $post_type,
				'post_status' => 'attachment' === $post_type ? 'inherit' : 'any',
				'posts_per_page' => -1,
				'fields' => 'ids',
				'meta_key' => '_avtozakup_demo',
				'meta_value' => '1',
				'no_found_rows' => true,
			)
		);

		foreach ( $ids as $post_id ) {
			if ( 'attachment' === $post_type ) {
				wp_delete_attachment( absint( $post_id ), true );
			} else {
				wp_delete_post( absint( $post_id ), true );
			}
		}
	}

	foreach ( array( 'product_cat', 'nav_menu' ) as $taxonomy ) {
		$terms = get_terms(
			array(
				'taxonomy' => $taxonomy,
				'hide_empty' => false,
				'meta_key' => '_avtozakup_demo',
				'meta_value' => '1',
			)
		);
		if ( is_wp_error( $terms ) ) {
			continue;
		}
		foreach ( $terms as $term ) {
			wp_delete_term( $term->term_id, $taxonomy );
		}
	}
}

if ( is_multisite() ) {
	$site_ids = get_sites( array( 'fields' => 'ids', 'number' => 0 ) );
	foreach ( $site_ids as $site_id ) {
		switch_to_blog( (int) $site_id );
		avtozakup_core_uninstall_site();
		restore_current_blog();
	}
} else {
	avtozakup_core_uninstall_site();
}

