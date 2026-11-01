<?php
/**
 * Fail-closed repair for legacy demo WooCommerce core pages.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

use RuntimeException;
use Throwable;
use WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Woo_Page_Repair {
	/** @var array<string, array{option:string,slug:string,titles:array<int,string>,block:string,shortcode:string}> */
	private const DEFINITIONS = array(
		'shop' => array(
			'option'    => 'woocommerce_shop_page_id',
			'slug'      => 'shop',
			'titles'    => array( 'Shop', 'Магазин' ),
			'block'     => '',
			'shortcode' => '',
		),
		'cart' => array(
			'option'    => 'woocommerce_cart_page_id',
			'slug'      => 'cart',
			'titles'    => array( 'Cart', 'Корзина' ),
			'block'     => 'woocommerce/cart',
			'shortcode' => '[woocommerce_cart]',
		),
		'checkout' => array(
			'option'    => 'woocommerce_checkout_page_id',
			'slug'      => 'checkout',
			'titles'    => array( 'Checkout', 'Оформление заказа' ),
			'block'     => 'woocommerce/checkout',
			'shortcode' => '[woocommerce_checkout]',
		),
	);
	private const LOCK_OPTION = 'avtozakup_woo_page_repair_lock';

	/**
	 * Build a zero-write repair plan.
	 *
	 * @return array{status:string,changes:int,items:array<string,array<string,mixed>>}
	 */
	public function plan(): array {
		$items = array();
		$changes = 0;

		foreach ( self::DEFINITIONS as $kind => $definition ) {
			$current_id = absint( get_option( $definition['option'] ) );
			$current = get_post( $current_id );
			if ( ! $this->is_usable_page( $current ) ) {
				throw new RuntimeException( sprintf( '%s option does not reference a usable page (ID %d).', $kind, $current_id ) );
			}

			$demo_marker = (string) get_post_meta( $current_id, Demo_Seeder::DEMO_META, true );
			$demo_key = (string) get_post_meta( $current_id, Demo_Seeder::DEMO_KEY_META, true );
			if ( '' === $demo_marker && '' === $demo_key ) {
				$items[ $kind ] = $this->plan_item( $kind, $definition, $current, $current, 'preserve' );
				continue;
			}

			if ( '1' !== $demo_marker || 'page:' . $kind !== $demo_key ) {
				throw new RuntimeException( sprintf( '%s option page ID %d has ambiguous ownership markers.', $kind, $current_id ) );
			}
			if ( 'publish' !== $current->post_status ) {
				throw new RuntimeException( sprintf( '%s demo page ID %d is not published.', $kind, $current_id ) );
			}
			$this->assert_single_demo_page( $kind, $current_id );

			$candidate = $this->find_single_canonical_candidate( $kind, $definition['slug'] );

			$this->assert_safe_candidate( $kind, $definition, $candidate );
			if ( $candidate->ID === $current_id ) {
				throw new RuntimeException( sprintf( '%s demo page unexpectedly already owns canonical slug.', $kind ) );
			}

			$items[ $kind ] = $this->plan_item( $kind, $definition, $current, $candidate, 'switch_and_trash' );
			++$changes;
		}
		$this->assert_unique_page_mapping( $items );

		return array(
			'status'  => $changes > 0 ? 'ready' : 'noop',
			'changes' => $changes,
			'items'   => $items,
		);
	}

	/**
	 * Apply a freshly validated plan and roll back every recorded write if an
	 * exception occurs. Unmarked candidate pages are never edited.
	 *
	 * @return array{status:string,changes:int,items:array<string,array<string,mixed>>}
	 */
	public function apply(): array {
		$lock_token = wp_generate_uuid4();
		if ( ! add_option( self::LOCK_OPTION, $lock_token, '', false ) ) {
			throw new RuntimeException( 'Another WooCommerce page repair is already running or left a lock.' );
		}

		try {
			return $this->apply_locked();
		} finally {
			if ( $lock_token === get_option( self::LOCK_OPTION ) ) {
				delete_option( self::LOCK_OPTION );
			}
		}
	}

	/** @return array{status:string,changes:int,items:array<string,array<string,mixed>>} */
	private function apply_locked(): array {
		$plan = $this->plan();
		if ( 'noop' === $plan['status'] ) {
			return $plan;
		}
		if ( ! defined( 'EMPTY_TRASH_DAYS' ) || (int) EMPTY_TRASH_DAYS <= 0 ) {
			throw new RuntimeException( 'WordPress Trash retention is disabled; repair refuses permanent deletion.' );
		}

		$snapshot = $this->snapshot( $plan );

		try {
			foreach ( $plan['items'] as $item ) {
				if ( 'switch_and_trash' === $item['action'] ) {
					update_option( $item['option'], $item['candidate_id'] );
				}
			}

			$this->update_owned_references( $plan );

			foreach ( $plan['items'] as $kind => $item ) {
				if ( 'switch_and_trash' !== $item['action'] ) {
					continue;
				}
				$this->assert_demo_page( $item['current_id'], $kind );
				if ( absint( get_option( $item['option'] ) ) !== $item['candidate_id'] ) {
					throw new RuntimeException( sprintf( '%s option was not switched before cleanup.', $kind ) );
				}
				$this->assert_not_referenced_by_woocommerce( $item['current_id'] );
				if ( ! wp_trash_post( $item['current_id'] ) ) {
					throw new RuntimeException( sprintf( 'Could not move %s demo page ID %d to Trash.', $kind, $item['current_id'] ) );
				}
			}
			$this->assert_candidate_hashes( $snapshot['candidate_hashes'] );

			flush_rewrite_rules( false );
			$plan['status'] = 'applied';
			return $plan;
		} catch ( Throwable $throwable ) {
			$rollback_errors = $this->rollback( $snapshot );
			$message = 'WooCommerce page repair failed; recorded writes were rolled back. ' . $throwable->getMessage();
			if ( ! empty( $rollback_errors ) ) {
				$message .= ' Rollback errors: ' . implode( '; ', $rollback_errors );
			}
			throw new RuntimeException( $message, 0, $throwable );
		}
	}

	/**
	 * @param array<string, string|array<int, string>> $definition Page definition.
	 * @return array<string, mixed>
	 */
	private function plan_item( string $kind, array $definition, WP_Post $current, WP_Post $candidate, string $action ): array {
		return array(
			'kind'           => $kind,
			'option'         => $definition['option'],
			'action'         => $action,
			'current_id'     => $current->ID,
			'current_slug'   => $current->post_name,
			'current_url'    => get_permalink( $current ) ?: '',
			'candidate_id'   => $candidate->ID,
			'candidate_slug' => $candidate->post_name,
			'candidate_url'  => get_permalink( $candidate ) ?: '',
			'canonical_slug' => $definition['slug'],
		);
	}

	/** @param array<string, string|array<int, string>> $definition Page definition. */
	private function assert_safe_candidate( string $kind, array $definition, WP_Post $candidate ): void {
		if (
			'page' !== $candidate->post_type
			|| 'publish' !== $candidate->post_status
			|| $definition['slug'] !== $candidate->post_name
			|| 0 !== absint( $candidate->post_parent )
			|| '' !== $candidate->post_password
		) {
			throw new RuntimeException( sprintf( '%s canonical candidate ID %d has an unsafe page shape.', $kind, $candidate->ID ) );
		}

		if (
			'' !== (string) get_post_meta( $candidate->ID, Demo_Seeder::DEMO_META, true )
			|| '' !== (string) get_post_meta( $candidate->ID, Demo_Seeder::DEMO_KEY_META, true )
		) {
			throw new RuntimeException( sprintf( '%s canonical candidate ID %d is not unmarked.', $kind, $candidate->ID ) );
		}

		if ( ! in_array( $candidate->post_title, $definition['titles'], true ) ) {
			throw new RuntimeException( sprintf( '%s canonical candidate ID %d has a non-default title.', $kind, $candidate->ID ) );
		}

		if ( ! empty( wp_get_post_revisions( $candidate->ID, array( 'posts_per_page' => 1 ) ) ) ) {
			throw new RuntimeException( sprintf( '%s canonical candidate ID %d has revisions and may be user-edited.', $kind, $candidate->ID ) );
		}

		$content = trim( $candidate->post_content );
		if ( 'shop' === $kind && '' !== $content ) {
			throw new RuntimeException( sprintf( 'shop canonical candidate ID %d is not empty.', $candidate->ID ) );
		}
		if (
			'shop' !== $kind
			&& $definition['shortcode'] !== $content
			&& ! has_block( $definition['block'], $candidate->post_content )
		) {
			throw new RuntimeException( sprintf( '%s canonical candidate ID %d has no expected WooCommerce block or shortcode.', $kind, $candidate->ID ) );
		}
	}

	private function assert_single_demo_page( string $kind, int $expected_id ): void {
		$ids = get_posts(
			array(
				'post_type'      => 'page',
				'post_status'    => array_keys( get_post_stati() ),
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'meta_key'       => Demo_Seeder::DEMO_KEY_META,
				'meta_value'     => 'page:' . $kind,
				'no_found_rows'  => true,
			)
		);
		$ids = array_values(
			array_filter(
				array_map( 'absint', $ids ),
				static fn ( int $id ): bool => '1' === (string) get_post_meta( $id, Demo_Seeder::DEMO_META, true )
			)
		);
		if ( array( $expected_id ) !== $ids ) {
			throw new RuntimeException( sprintf( '%s must have exactly one marked demo page, expected ID %d.', $kind, $expected_id ) );
		}
	}

	private function find_single_canonical_candidate( string $kind, string $slug ): WP_Post {
		$candidates = get_posts(
			array(
				'post_type'      => 'page',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'name'           => $slug,
				'no_found_rows'  => true,
			)
		);
		$candidates = array_values(
			array_filter(
				$candidates,
				static fn ( $candidate ): bool => $candidate instanceof WP_Post && $slug === $candidate->post_name
			)
		);
		if ( 1 !== count( $candidates ) ) {
			throw new RuntimeException( sprintf( '%s requires exactly one page with canonical slug /%s; found %d.', $kind, $slug, count( $candidates ) ) );
		}
		return $candidates[0];
	}

	/** @param array<string, array<string, mixed>> $items Plan items. */
	private function assert_unique_page_mapping( array $items ): void {
		$candidate_ids = array_map( static fn ( array $item ): int => absint( $item['candidate_id'] ), $items );
		$myaccount_id = absint( get_option( 'woocommerce_myaccount_page_id' ) );
		if ( ! $this->is_usable_page( get_post( $myaccount_id ) ) ) {
			throw new RuntimeException( sprintf( 'myaccount option does not reference a usable page (ID %d).', $myaccount_id ) );
		}
		$final_ids = array_merge( $candidate_ids, array( $myaccount_id ) );
		if ( count( $final_ids ) !== count( array_unique( $final_ids ) ) ) {
			throw new RuntimeException( 'Final WooCommerce core page IDs are not unique.' );
		}

		$all_options = array_merge(
			array_column( self::DEFINITIONS, 'option' ),
			array( 'woocommerce_myaccount_page_id' )
		);
		foreach ( $items as $kind => $item ) {
			if ( 'switch_and_trash' !== $item['action'] ) {
				continue;
			}
			foreach ( $all_options as $option ) {
				if ( $option !== $item['option'] && absint( get_option( $option ) ) === $item['candidate_id'] ) {
					throw new RuntimeException( sprintf( '%s candidate ID %d is already assigned to %s.', $kind, $item['candidate_id'], $option ) );
				}
			}
		}
	}

	private function is_usable_page( ?WP_Post $page ): bool {
		return $page instanceof WP_Post
			&& 'page' === $page->post_type
			&& ! in_array( $page->post_status, array( 'trash', 'auto-draft' ), true );
	}

	private function assert_demo_page( int $page_id, string $kind ): void {
		if (
			'1' !== (string) get_post_meta( $page_id, Demo_Seeder::DEMO_META, true )
			|| 'page:' . $kind !== (string) get_post_meta( $page_id, Demo_Seeder::DEMO_KEY_META, true )
		) {
			throw new RuntimeException( sprintf( '%s cleanup target ID %d lost its demo markers.', $kind, $page_id ) );
		}
	}

	/**
	 * @param array{status:string,changes:int,items:array<string,array<string,mixed>>} $plan Repair plan.
	 * @return array<string, mixed>
	 */
	private function snapshot( array $plan ): array {
		$options = array();
		foreach ( self::DEFINITIONS as $definition ) {
			$options[ $definition['option'] ] = get_option( $definition['option'] );
		}

		$candidate_hashes = array();
		$cleanup_pages = array();
		foreach ( $plan['items'] as $item ) {
			$candidate_hashes[ $item['candidate_id'] ] = $this->page_hash( $item['candidate_id'] );
			if ( 'switch_and_trash' === $item['action'] ) {
				$page = get_post( $item['current_id'] );
				if ( ! $page instanceof WP_Post ) {
					throw new RuntimeException( sprintf( 'Cleanup page ID %d disappeared before snapshot.', $item['current_id'] ) );
				}
				$cleanup_pages[ $item['current_id'] ] = array(
					'status'       => $page->post_status,
					'slug'         => $page->post_name,
					'hash'         => $this->page_hash( $page->ID ),
					'revision_ids' => $this->revision_ids( $page->ID ),
				);
			}
		}

		return array(
			'options'          => $options,
			'settings'         => get_option( Settings::OPTION_NAME, false ),
			'manifest'         => get_option( Demo_Seeder::MANIFEST_OPTION, false ),
			'candidate_hashes' => $candidate_hashes,
			'cleanup_pages'    => $cleanup_pages,
		);
	}

	/** @param array{status:string,changes:int,items:array<string,array<string,mixed>>} $plan Repair plan. */
	private function update_owned_references( array $plan ): void {
		$settings = get_option( Settings::OPTION_NAME, false );
		$manifest = get_option( Demo_Seeder::MANIFEST_OPTION, false );
		if ( ! is_array( $settings ) || ! is_array( $manifest ) ) {
			throw new RuntimeException( 'Homepage settings or demo manifest is unavailable; repair cannot update owned references.' );
		}

		foreach ( $plan['items'] as $kind => $item ) {
			if ( 'preserve' === $item['action'] ) {
				continue;
			}

			$new_id = $item['candidate_id'];
			$new_url = get_permalink( $new_id ) ?: $item['candidate_url'];

			if (
				'shop' === $kind
				&& is_array( $settings )
				&& isset( $settings['hero_primary_url'] )
				&& $item['current_url'] === $settings['hero_primary_url']
			) {
				$settings['hero_primary_url'] = $new_url;
			}

			$manifest['woocommerce_pages'] = is_array( $manifest['woocommerce_pages'] ?? null ) ? $manifest['woocommerce_pages'] : array();
			$manifest['pages'] = is_array( $manifest['pages'] ?? null ) ? $manifest['pages'] : array();
			$manifest['demo_pages'] = is_array( $manifest['demo_pages'] ?? null ) ? $manifest['demo_pages'] : array();
			$manifest['woocommerce_pages'][ $kind ] = $new_id;
			$manifest['pages'][ $kind ] = $new_id;
			unset( $manifest['demo_pages'][ $kind ] );
		}

		update_option( Settings::OPTION_NAME, $settings, false );
		update_option( Demo_Seeder::MANIFEST_OPTION, $manifest, false );
		if ( $settings !== get_option( Settings::OPTION_NAME, false ) ) {
			throw new RuntimeException( 'Homepage settings were not persisted exactly.' );
		}
		if ( $manifest !== get_option( Demo_Seeder::MANIFEST_OPTION, false ) ) {
			throw new RuntimeException( 'Demo manifest was not persisted exactly.' );
		}
	}

	private function assert_not_referenced_by_woocommerce( int $page_id ): void {
		$options = array_merge(
			array_column( self::DEFINITIONS, 'option' ),
			array( 'woocommerce_myaccount_page_id' )
		);
		foreach ( $options as $option ) {
			if ( absint( get_option( $option ) ) === $page_id ) {
				throw new RuntimeException( sprintf( 'Demo page ID %d is still referenced by %s.', $page_id, $option ) );
			}
		}
	}

	/** @param array<int, string> $expected_hashes Canonical page hashes. */
	private function assert_candidate_hashes( array $expected_hashes ): void {
		foreach ( $expected_hashes as $page_id => $expected_hash ) {
			if ( $expected_hash !== $this->page_hash( $page_id ) ) {
				throw new RuntimeException( sprintf( 'Unmarked candidate page ID %d changed during repair.', $page_id ) );
			}
		}
	}

	private function page_hash( int $page_id ): string {
		$page = get_post( $page_id );
		if ( ! $page instanceof WP_Post ) {
			return '';
		}
		return hash(
			'sha256',
			wp_json_encode(
				array(
					$page->post_title,
					$page->post_name,
					$page->post_content,
					$page->post_status,
					$page->post_parent,
					$page->post_password,
					get_post_meta( $page_id ),
				)
			)
		);
	}

	/** @return array<int, int> */
	private function revision_ids( int $page_id ): array {
		$ids = array_map( 'absint', array_keys( wp_get_post_revisions( $page_id ) ) );
		sort( $ids );
		return $ids;
	}

	/**
	 * @param array<string, mixed> $snapshot Pre-write options.
	 * @return array<int, string>
	 */
	private function rollback( array $snapshot ): array {
		$errors = array();

		foreach ( array_reverse( $snapshot['cleanup_pages'], true ) as $page_id => $state ) {
			try {
				$page = get_post( $page_id );
				if ( ! $page instanceof WP_Post ) {
					throw new RuntimeException( sprintf( 'cleanup page %d is missing', $page_id ) );
				}
				if ( 'trash' === $page->post_status && ! wp_untrash_post( $page_id ) ) {
					throw new RuntimeException( sprintf( 'could not untrash page %d', $page_id ) );
				}
				$result = wp_update_post(
					array(
						'ID'          => $page_id,
						'post_status' => $state['status'],
						'post_name'   => $state['slug'],
					),
					true
				);
				if ( is_wp_error( $result ) ) {
					throw new RuntimeException( $result->get_error_message() );
				}
				$new_revision_ids = array_diff( $this->revision_ids( $page_id ), $state['revision_ids'] );
				foreach ( $new_revision_ids as $revision_id ) {
					if ( ! wp_delete_post( $revision_id, true ) ) {
						throw new RuntimeException( sprintf( 'could not remove rollback revision %d', $revision_id ) );
					}
				}
				$restored = get_post( $page_id );
				if (
					! $restored instanceof WP_Post
					|| $state['status'] !== $restored->post_status
					|| $state['slug'] !== $restored->post_name
					|| $state['hash'] !== $this->page_hash( $page_id )
					|| $state['revision_ids'] !== $this->revision_ids( $page_id )
				) {
					throw new RuntimeException( sprintf( 'cleanup page %d state was not restored exactly', $page_id ) );
				}
			} catch ( Throwable $throwable ) {
				$errors[] = $throwable->getMessage();
			}
		}

		foreach ( $snapshot['options'] as $option => $value ) {
			try {
				update_option( $option, $value );
				if ( $value !== get_option( $option ) ) {
					throw new RuntimeException( sprintf( 'option %s was not restored exactly', $option ) );
				}
			} catch ( Throwable $throwable ) {
				$errors[] = $throwable->getMessage();
			}
		}

		try {
			$this->restore_option( Settings::OPTION_NAME, $snapshot['settings'] );
			if ( $snapshot['settings'] !== get_option( Settings::OPTION_NAME, false ) ) {
				throw new RuntimeException( 'homepage settings were not restored exactly' );
			}
		} catch ( Throwable $throwable ) {
			$errors[] = $throwable->getMessage();
		}

		try {
			$this->restore_option( Demo_Seeder::MANIFEST_OPTION, $snapshot['manifest'] );
			if ( $snapshot['manifest'] !== get_option( Demo_Seeder::MANIFEST_OPTION, false ) ) {
				throw new RuntimeException( 'demo manifest was not restored exactly' );
			}
		} catch ( Throwable $throwable ) {
			$errors[] = $throwable->getMessage();
		}

		try {
			flush_rewrite_rules( false );
		} catch ( Throwable $throwable ) {
			$errors[] = $throwable->getMessage();
		}

		return $errors;
	}

	/** @param mixed $value Previous option value; false means absent for these array options. */
	private function restore_option( string $option, $value ): void {
		if ( false === $value ) {
			delete_option( $option );
			return;
		}
		update_option( $option, $value, false );
	}
}
