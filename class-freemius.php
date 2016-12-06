<?php
/**
 * Freemius class
 *
 * @since 3.2
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

/**
 * Initializes Freemius.
 */
function pbs_fs() {
	global $pbs_fs;

	if ( ! isset( $pbs_fs ) ) {

		// Include Freemius SDK.
		require_once dirname( __FILE__ ) . '/freemius/start.php';

		$pbs_fs = fs_dynamic_init( array(
			'id' => '203',
			'slug' => 'page-builder-sandwich',
			'type' => 'plugin',
			'public_key' => 'pk_24332b201c316345690967b25da99',
			'is_premium' => false,
			'has_addons' => false,
			'has_paid_plans' => true,
			'menu' => array(
				'slug' => 'page-builder-sandwich',
				'first-path' => 'admin.php?page=page-builder-sandwich',
				'support' => false,
			),


		) );
	}

	return $pbs_fs;
}

// Init Freemius.
pbs_fs();

// Uninstall logic.
require_once( 'function-uninstall.php' );
pbs_fs()->add_action( 'after_uninstall', 'pbs_uninstall' );


/**
 * Add our own icon in the opt-in screen.
 *
 * @since 3.2
 *
 * @param string $image_path The URL path to the avatar.
 *
 * @return string The modified URL path to the avatar.
 */
function pbs_freemius_icon( $image_path ) {
	return str_replace( WP_PLUGIN_URL, '', plugins_url( 'page_builder_sandwich/images/pbs-logo.png', __FILE__ ) );
}
pbs_fs()->add_filter( 'plugin_icon', 'pbs_freemius_icon' );


/**
 * Customize the Freemius connection message.
 *
 * @since 3.3
 *
 * @param string $message The current opt-in message.
 * @param string $user_first_name First name of the user.
 * @param string $plugin_title PBS name.
 * @param string $user_login The link to the user's login.
 * @param string $site_link Anchor html link to the current site.
 * @param string $freemius_link Anchor html link to Freemius.com.
 *
 * @return string The connection message.
 */
function pbs_fs_custom_connect_message( $message, $user_first_name, $plugin_title, $user_login, $site_link, $freemius_link ) {
	return sprintf(
		__fs( 'hey-x' ) . '<br>' .
		__( 'Never miss an important update - opt-in to our security and feature updates notifications, non-sensitive diagnostic tracking with %s, and statistical tracking with %s', PAGE_BUILDER_SANDWICH ),
		$user_first_name,
		$freemius_link,
		'<a href="https://pagebuildersandwich.com/" target="_blank">pagebuildersandwich.com</a>'
	);
}

pbs_fs()->add_filter( 'connect_message', 'pbs_fs_custom_connect_message', 10, 6 );


/**
 * Migrate right away to Freemius when PBS has been activated if there is
 * an existing EDD license.
 *
 * @param string $plugin The activated plugin.
 */
// function pbs_auto_apply_existing_license( $plugin ) {
//
// Only do this when PBS is activated.
// if ( plugin_basename( PBS_FILE ) === $plugin && function_exists( 'pbs_try_migrate_on_activation' ) ) {
//
// Only do this when there's a stored PBS license.
// (It's okay if it's invalid since migration checks it again).
// $license = get_option( 'pbs_license' );
// if ( get_option( 'pbs_license_status' ) === 'valid' && ! empty( $license ) ) {
//
// Don't do this again if we just did it.
// if ( get_transient( 'pbs_license_migration' ) ) {
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
// $args['license_key'] = get_option( 'pbs_license' );
//
// Delete the stored licenses since we don't need them anymore.
// delete_option( 'pbs_license_status' );
// delete_option( 'pbs_license' );
//
// Make sure we don't do this again.
// set_transient( 'pbs_license_migration', '1', 60 );
//
// Trigger a migration of our EDD license key to Freemius.
// $next_page = pbs_try_migrate_on_activation( $response, $args );
//
// If we got a URL, follow it.
// if ( ! empty( $next_page ) && fs_redirect( $next_page ) ) {
// exit();
// }
//
// If it fails somehow.
// wp_redirect( admin_url( 'admin.php?page=page-builder-sandwich' ) );
// die();
// }
// }
// }
// add_action( 'activated_plugin', 'pbs_auto_apply_existing_license', 9 );
