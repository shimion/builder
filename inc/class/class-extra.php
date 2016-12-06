<?php
/**
 * Freemius class
 *
 * @since 3.2
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

/**
 * Initializes Freemius.
 */
function nhb_fs() {
	global $nhb_fs;

	if ( ! isset( $nhb_fs ) ) {

		// Include Freemius SDK.
		require_once inc . '/extra/start.php';

		$nhb_fs = fs_dynamic_init( array(
			'id' => '203',
			'slug' => 'no-hassle-builder',
			'type' => 'plugin',
			'public_key' => 'pk_24332b201c316345690967b25da99',
			'is_premium' => true,
			'has_addons' => true,
			'has_paid_plans' => true,
			'menu' => array(
				'slug' => 'no-hassle-builder',
				'first-path' => 'admin.php?page=no-hassle-builder',
				'support' => false,
			),


		) );
	}

	return $nhb_fs;
}

// Init Freemius.
nhb_fs();

// Uninstall logic.
require_once( 'function-uninstall.php' );
nhb_fs()->add_action( 'after_uninstall', 'nhb_uninstall' );


/**
 * Add our own icon in the opt-in screen.
 *
 * @since 3.2
 *
 * @param string $image_path The URL path to the avatar.
 *
 * @return string The modified URL path to the avatar.
 */
function nhb_freemius_icon( $image_path ) {
	return str_replace( WP_PLUGIN_URL, '', plugins_url( 'no_hassle_builder/images/nhb-logo.png', __FILE__ ) );
}
nhb_fs()->add_filter( 'plugin_icon', 'nhb_freemius_icon' );


/**
 * Customize the Freemius connection message.
 *
 * @since 3.3
 *
 * @param string $message The current opt-in message.
 * @param string $user_first_name First name of the user.
 * @param string $plugin_title nhb name.
 * @param string $user_login The link to the user's login.
 * @param string $site_link Anchor html link to the current site.
 * @param string $freemius_link Anchor html link to Freemius.com.
 *
 * @return string The connection message.
 */
function nhb_fs_custom_connect_message( $message, $user_first_name, $plugin_title, $user_login, $site_link, $freemius_link ) {
	return sprintf(
		__fs( 'hey-x' ) . '<br>' .
		__( 'Never miss an important update - opt-in to our security and feature updates notifications, non-sensitive diagnostic tracking with %s, and statistical tracking with %s', NO_HASSLE_BUILDER ),
		$user_first_name,
		$freemius_link,
		'<a href="https://pagebuildersandwich.com/" target="_blank">pagebuildersandwich.com</a>'
	);
}

nhb_fs()->add_filter( 'connect_message', 'nhb_fs_custom_connect_message', 10, 6 );


/**
 * Migrate right away to Freemius when nhb has been activated if there is
 * an existing EDD license.
 *
 * @param string $plugin The activated plugin.
 */
// function nhb_auto_apply_existing_license( $plugin ) {
//
// Only do this when nhb is activated.
// if ( plugin_basename( nhb_FILE ) === $plugin && function_exists( 'nhb_try_migrate_on_activation' ) ) {
//
// Only do this when there's a stored nhb license.
// (It's okay if it's invalid since migration checks it again).
// $license = get_option( 'nhb_license' );
// if ( get_option( 'nhb_license_status' ) === 'valid' && ! empty( $license ) ) {
//
// Don't do this again if we just did it.
// if ( get_transient( 'nhb_license_migration' ) ) {
// return;
// }
//
// Emulate an invalid key response, because migration needs this.
// $response = new stdClass();
// $response->error = new stdClass();
// $response->error->code = 'invalid_license_key';
//
// Our stored license key.
// $args = array();
// $args['license_key'] = get_option( 'nhb_license' );
//
// Delete the stored licenses since we don't need them anymore.
// delete_option( 'nhb_license_status' );
// delete_option( 'nhb_license' );
//
// Make sure we don't do this again.
// set_transient( 'nhb_license_migration', '1', 60 );
//
// Trigger a migration of our EDD license key to Freemius.
// $next_page = nhb_try_migrate_on_activation( $response, $args );
//
// If we got a URL, follow it.
// if ( ! empty( $next_page ) && fs_redirect( $next_page ) ) {
// exit();
// }
//
// If it fails somehow.
// wp_redirect( admin_url( 'admin.php?page=no-hassle-builder' ) );
// die();
// }
// }
// }
// add_action( 'activated_plugin', 'nhb_auto_apply_existing_license', 9 );
