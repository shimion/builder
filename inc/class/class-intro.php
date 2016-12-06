<?php
/**
 * Introduction Tour for the frontend.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbIntro' ) ) {

	/**
	 * This is where all the intro functionality happens.
	 */
	class nhbIntro {

		/**
		 * Hook into the frontend.
		 */
		function __construct() {
			add_filter( 'nhb_localize_scripts', array( $this, 'localize_scripts' ) );
		}

		/**
		 * Trigger the tour to show only for first time usage.
		 *
		 * @param array $args Localization array.
		 *
		 * @return array The modified localization array.
		 */
		public function localize_scripts( $args ) {
			$args['do_intro'] = get_option( 'nhb_first_load_intro_v3' ) === false;

			update_option( 'nhb_first_load_intro_v3', 'done' );
			return $args;
		}
	}
}

new nhbIntro();
