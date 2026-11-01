<?php
/**
 * VIN request integration boundary.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface VinRequestAdapterInterface {
	/**
	 * Submit a validated request to a real configured workflow.
	 *
	 * No demo implementation is registered by this plugin.
	 *
	 * @param array<string, mixed> $request Validated VIN request.
	 * @return array<string, mixed>
	 */
	public function submit( array $request ): array;
}

