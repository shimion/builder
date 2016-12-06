<?php
/**
 * The main plugin file
 *
 * @package No Hassle Builder
 */

/**
Plugin Name: No Hassel Builder
Description: The easiest way to build your website without any code. A true drag & drop page builder for WordPress.
Author: Gambit Technologies
Version: 3.3
Author URI: http://gambit.ph
Plugin URI: http://pagebuildersandwich.com
Text Domain: no-hassle-builder
Domain Path: /languages/
SKU: nhb
 */


define('NBD', plugin_dir_path( __FILE__ ));

define('inc', NBD . 'inc/');
define('classes', inc . 'class/');


if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

/**
 * Detect if there is another version of nhb currently activated. If there is,
 * show an error since multiple plugins will cause errors.
 */
if ( defined( 'VERSION_NO_HASSLE_BUILDER' ) ) {
	trigger_error( 'Seems like you have the Lite version of No Hassle Builder activated. Please deactivate it first then try again.', E_USER_ERROR );
	return;
}

// Identifies the current plugin version.
defined( 'VERSION_NO_HASSLE_BUILDER' ) or define( 'VERSION_NO_HASSLE_BUILDER', '3.3' );

// The slug used for translations & other identifiers.
defined( 'NO_HASSLE_BUILDER' ) or define( 'NO_HASSLE_BUILDER', 'no-hassle-builder' );

defined( 'nhb_FILE' ) or define( 'nhb_FILE', __FILE__ );

// Shows/hides Lite code.
define( 'nhb_IS_LITE', true );

// Shows/hides Pro code.
define( 'nhb_IS_PRO', false );

if ( ! function_exists( 'nhb_is_dev' ) ) {
	/**
	 * Returns true if we are in development mode and not in a built copy.
	 *
	 * @since 2.18
	 *
	 * @return boolean True if we are developing.
	 */
	function nhb_is_dev() {
		if ( defined( 'WP_DEBUG' ) ) {
			if ( WP_DEBUG ) {
				return file_exists( trailingslashit( plugin_dir_path( __FILE__ ) ) . '_design-element-cleanup.php' );
			}
		}
		return false;
	}
}
global $nhb_fs;
include_once(inc.'inc.php');

// Initializes plugin class.
if ( ! class_exists( 'PageBuilderSandwichPlugin' ) ) {

	/**
	 * Initializes core plugin that is readable by WordPress.
	 *
	 * @return	void
	 * @since	1.0
	 */
	class PageBuilderSandwichPlugin {

		/**
		 * Hook into WordPress.
		 *
		 * @return	void
		 * @since	1.0
		 */
		function __construct() {

			// Our translations.
			add_action( 'plugins_loaded', array( $this, 'load_text_domain' ), 1 );

			// Plugin links for internal developer tools.
			add_filter( 'plugin_row_meta', array( $this, 'dev_tool_links' ), 10, 2 );

			// Put a notice on how to edit using nhb.
			add_action( 'admin_notices', array( $this, 'plugin_activation_notice' ) );

			// Add edit with nhb links to posts & pages.
			add_filter( 'post_row_actions', array( $this, 'add_nhb_edit_link' ), 10, 2 );
			add_filter( 'page_row_actions', array( $this, 'add_nhb_edit_link' ), 10, 2 );

			new nhbMigration();
		}


		/**
		 * Loads the translations.
		 *
		 * @return	void
		 * @since	1.0
		 */
		public function load_text_domain() {
			load_plugin_textdomain( NO_HASSLE_BUILDER, false, basename( dirname( __FILE__ ) ) . '/languages/' );
		}


		/**
		 * Adds plugin links.
		 *
		 * @access	public
		 * @param	array  $plugin_meta The current array of links.
		 * @param	string $plugin_file The plugin file.
		 * @return	array The current array of links together with our additions.
		 * @since	1.0
		 **/
		public function plugin_links( $plugin_meta, $plugin_file ) {
			if ( plugin_basename( __FILE__ ) === $plugin_file ) {

				global $nhb_fs;
				if ( nhb_IS_LITE || ! $nhb_fs->can_use_premium_code() ) {
					$plugin_meta[] = sprintf( "<a href='%s' target='_blank'>%s</a>",
						esc_url( admin_url( '/admin.php?page=no-hassle-builder-pricing' ) ),
						__( 'Go Premium', NO_HASSLE_BUILDER )
					);
				} else {
					$plugin_meta[] = sprintf( "<a href='%s' target='_blank' class='nhb-plugin-placeholder'>%s</a>",
						esc_url( admin_url( '/admin.php?page=no-hassle-builder-contact' ) ),
						__( 'Get Customer Support', NO_HASSLE_BUILDER )
					);
				}
			}
			return $plugin_meta;
		}


		/**
		 * Adds plugin links for different developer tools (for internal use only, these won't show up in user's sites).
		 *
		 * @access	public
		 * @param	array  $plugin_meta The current array of links.
		 * @param	string $plugin_file The plugin file.
		 * @return	array The current array of links together with our additions.
		 * @since	2.16
		 **/
		public function dev_tool_links( $plugin_meta, $plugin_file ) {
			if ( plugin_basename( __FILE__ ) === $plugin_file ) {

				if ( nhb_is_dev() ) {
					$plugin_meta[] = sprintf( "<br><a href='%s' target='_blank'>%s</a>",
						plugins_url( '_design-element-cleanup.php', __FILE__ ),
						'[DEV TOOL] Pre-Designed Element HTML Cleaner'
					);
				}
			}
			return $plugin_meta;
		}


		/**
		 * Displays a notice for first time users to create a new page/post to start using nhb.
		 *
		 * @since 2.8.1
		 */
		public function plugin_activation_notice() {
			if ( get_option( 'nhb_plugin_activation_notice' ) === false ) {

				// Only show this once.
				update_option( 'nhb_plugin_activation_notice', 'done' );

				$post_type = null;
				if ( current_user_can( 'publish_pages' ) ) {
					$post_type = 'page';
				} else if ( current_user_can( 'publish_posts' ) ) {
					$post_type = 'post';
				}

				if ( $post_type ) {
					$new_post = get_default_post_to_edit( $post_type, true );
					$preview_link = esc_url( get_preview_post_link( $new_post ) );
					$nonce_action = 'update-post_' . $new_post->ID;
					$referer = wp_get_referer();

					?>
					<div class='updated'>
						<p>
							<form action='post.php' method='post' id='nhb-new-post' name='post' target='_self'>
								<input type='hidden' id='title' name='post_title' value='<?php echo esc_attr( 'Just Trying Out nhb', NO_HASSLE_BUILDER ) ?>'/>
								<input type='hidden' id='post_ID' name='post_ID' value='<?php echo esc_attr( $new_post->ID ) ?>'>
								<input type='hidden' id='post_type' name='post_type' value='<?php echo esc_attr( $post_type ) ?>'>
								<input type='hidden' id='original_post_status' name='original_post_status' value='auto-draft'>
								<?php wp_nonce_field( $nonce_action ) ?>
								<input type='hidden' id='user-id' name='user_ID' value='<?php echo esc_attr( get_current_user_id() ) ?>'>
								<input type='hidden' id='hiddenaction' name='action' value='editpost'>
								<input type='hidden' id='originalaction' name='originalaction' value='editpost'>
								<input type='hidden' id='post_author' name='post_author' value='1'>
								<input type='hidden' id='referredby' name='referredby' value='<?php echo $referer ? esc_url( $referer ) : ''; ?>'>
								<input type='hidden' id='auto_draft' name='auto_draft' value='1'>
								<input type='hidden' name='wp-preview' id='wp-preview' value='dopreview' />

								<?php
								printf(
									esc_html__( "Thanks for activating No Hassle Builder! To get started, visit any page or post in your site. %sOr let's create a new %s right now and I'll tour you on how to use PB Sandwich.%s (This will create a new draft %s)", NO_HASSLE_BUILDER ),
									'<a href="' . esc_url( $preview_link ) . '" onclick="document.getElementById(\'nhb-new-post\').submit(); return false;">',
									esc_html__( $post_type ),
									'</a>',
									esc_html__( $post_type )
								);
								?>
							</form>
						</p>
					</div>
					<?php

					// If the user doesn't have any privileges.
				} else {
					?>
					<div class='updated'>
						<p>
							<?php esc_html_e( 'Thanks for activating No Hassle Builder! To get started, visit any page or post in your site to begin using No Hassle Builder. You will need to have editing privileges to edit them.', NO_HASSLE_BUILDER ) ?>
						</p>
					</div>
					<?php
				}
			}
		}


		/**
		 * Adds "Edit with nhb" links to posts, pages and CPTs.
		 * Will only add a link to viewable post types.
		 *
		 * @since 3.1
		 *
		 * @param array   $actions The list of links for this post.
		 * @param WP_Post $post The current post.
		 *
		 * @return array The list of links to display.
		 */
		public function add_nhb_edit_link( $actions, $post ) {
			$post_type_object = get_post_type_object( $post->post_type );
			$can_edit_post = current_user_can( 'edit_post', $post->ID );

			if ( is_post_type_viewable( $post_type_object ) ) {
				if ( in_array( $post->post_status, array( 'pending', 'draft', 'future' ), true ) ) {
					if ( $can_edit_post ) {
						$actions['edit_nhb'] = sprintf( '<a href="%s" title="%s" onclick="localStorage.setItem( \'nhb-open-%d\', \'1\' )">%s</a>',
							esc_url( get_preview_post_link( $post ) ),
							esc_attr__( 'Edit with No Hassle Builder', NO_HASSLE_BUILDER ),
							absint( $post->ID ),
							esc_html__( 'Edit with No Hassle Builder', NO_HASSLE_BUILDER )
						);
					}
				} elseif ( 'trash' !== $post->post_status ) {
					$actions['edit_nhb'] = sprintf( '<a href="%s" title="%s" onclick="localStorage.setItem( \'nhb-open-%d\', \'1\' )">%s</a>',
						esc_url( get_permalink( $post->ID ) ),
						esc_attr__( 'Edit with No Hassle Builder', NO_HASSLE_BUILDER ),
						absint( $post->ID ),
						esc_html__( 'Edit with No Hassle Builder', NO_HASSLE_BUILDER )
					);
				}
			}

			return $actions;
		}
	}

	new PageBuilderSandwichPlugin();
}
