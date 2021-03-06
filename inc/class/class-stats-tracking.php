<?php
/**
 * Stats tracking for awesome nhb usage.
 *
 * @since 2.11
 * @since 3.2 Now uses Freemius opt-in.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}


defined( 'nhb_STATS_URL' ) or define( 'nhb_STATS_URL', 'http://pagebuildersandwich.com/wp-json/nhb/v1/submit_stats' );

if ( ! class_exists( 'nhbStatsTracking' ) ) {

	/**
	 * This is where all the stats tracking functionality happens.
	 */
	class nhbStatsTracking {

		/**
		 * Hook into the frontend.
		 */
		function __construct() {
			global $nhb_fs;

			if ( $nhb_fs->is_registered() ) {
				add_filter( 'nhb_localize_scripts', array( $this, 'add_opted_in_status' ) );
				add_action( 'wp_ajax_nhb_save_content_tracking', array( $this, 'send_tracking_data' ) );
			}
		}



		/**
		 * Sends the data to be tracked to nhb API (blocking), called by an ajax call.
		 *
		 * @since 2.11.1
		 * @since 3.2 Now uses Freemius opt-in.
		 */
		public function send_tracking_data() {

			// Allow others to stop usage tracking.
			if ( ! apply_filters( 'nhb_stats_tracking', true ) ) {
				die();
			}

			if ( empty( $_POST['save_nonce'] ) ) { // Input var: okay.
				die();
			}

			// Security check.
			if ( ! wp_verify_nonce( sanitize_key( $_POST['save_nonce'] ), 'nhb' ) ) { // Input var: okay.
				die();
			}

			// Check if we have the necessary fields.
			if ( empty( $_POST['post_id'] ) || ! isset( $_POST['main-content'] ) ) { // Input var: okay.
				die();
			}

			// Sanitize data.
			$post_id = intval( $_POST['post_id'] ); // Input var: okay.
			$content = sanitize_post_field( 'post_content', wp_unslash( $_POST['main-content'] ), $post_id, 'db' ); // Input var: okay. WPCS: sanitization ok.

			global $nhb_fs;
			$data = array(
				'referrer' => trailingslashit( get_site_url() ),
				'post_id' => $post_id,
				'content' => trim( str_replace( "\n", '', $content ) ),
				'is_lite' => nhb_IS_LITE && $nhb_fs->can_use_premium_code() ? '1' : '0',
				'theme' => wp_get_theme()->Name,
				'icon_searches' => '',
			);

			if ( ! empty( $_POST['icon_searches'] ) ) { // Input var: okay.
				$data['icon_searches'] = sanitize_text_field( wp_unslash( $_POST['icon_searches'] ) ); // Input var: okay.
			}

			// Generate a unique hash that will be used for security checks.
			$data['hash'] = md5( $data['referrer'] . $data['post_id'] . $data['content'] . $data['is_lite'] . $data['theme'] . $data['icon_searches'] );

			$request = wp_remote_post( nhb_STATS_URL,
				array(
					'sslverify' => false,
					'body' => $data,
				)
			);

			die();
		}


		/**
		 * Adds the JS parameters needed to turn on usage tracking.
		 *
		 * @since 3.2
		 *
		 * @param array $params The localization parameters for the main nhb script.
		 *
		 * @return array The modified localization parameters.
		 *
		 * @see _nhb-stats_tracking.js
		 */
		public function add_opted_in_status( $params ) {
			if ( ! apply_filters( 'nhb_stats_tracking', true ) ) {
				return $params;
			}

			$params['tracking_opted_in'] = '1';
			return $params;
		}
	}
}

new nhbStatsTracking();
