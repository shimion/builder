<?php
/**
 * Dummy vc_map function.
 * This file is only used if Visual Composer isn't available.
 *
 * @package No Hassle Builder
 *
 * @see nhbShortcodeMapper3rdParty::_vc_map
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! function_exists( 'vc_map' ) ) {

	/**
	 * Dummy function to capture calls to vc_map since the function does not exist.
	 *
	 * @param string $attributes The shortcode parameters.
	 */
	function vc_map( $attributes ) {
		// Gather all attributes here and put them in our own mapper.
		nhbShortcodeMapper3rdParty::_vc_map( $attributes );
	}
}
