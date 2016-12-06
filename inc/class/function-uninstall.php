<?php
/**
 * Uninstall file
 *
 * @since 3.1
 *
 * @package No Hassle Builder
 */

if ( ! function_exists( 'nhb_uninstall' ) ) {

	/**
	 * Uninstall function for Freemius.
	 */
	function nhb_uninstall() {

		// Used by class-migration.php.
		delete_option( 'nhb_no_migration_notice' );

		// Used by class-intro.php.
		delete_option( 'nhb_first_load_intro' ); // Old intro option.
		delete_option( 'nhb_first_load_intro_v3' );

		// Used by class-licensing.php.
		delete_option( 'nhb_license_status' );
		delete_option( 'nhb_license' );

		// Used by the admin notice for new users.
		delete_option( 'nhb_plugin_activation_notice' );

		// Used by class-lite-tracking.php.
		delete_option( 'nhb_lite_tracking_seconds' );
		delete_option( 'nhb_lite_tracking_shown60' );
		delete_option( 'nhb_lite_tracking_shown120' );
		delete_option( 'nhb_lite_tracking_shown180' );
		delete_option( 'nhb_lite_tracking_rated' );

		// Used by class-icons-uploader.php.
		delete_option( 'nhb_uploaded_svg' );

		// Used by class-stats-tracking.php.
		delete_option( 'nhb_stats_tracking_opted_in' ); // Deprecated.

		// Used by class-shortcode-mapper.php.
		delete_option( 'nhb_shortcode_mappings' );
		delete_option( 'nhb_shortcode_mappings_total' );
		delete_option( 'nhb_shortcode_mapped_plugins_total' );
		delete_option( 'nhb_shortcode_mapped_shortcodes_total' );

		// Used by class-freemius.php.
		delete_option( 'nhb_premium_notice' );

		// Used by class-ask-rating.php.
		delete_option( 'nhb_asked_rate_editing_time' );
		delete_option( 'nhb_asked_rate_edited_posts' );
		delete_option( 'nhb_has_rated' );
		delete_option( 'nhb_ask_total_editing_time' );
		delete_option( 'nhb_ask_posts_edited' );
	}
}
