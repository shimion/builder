<?php
/**
 * The main plugin file
 *
 * @package Page Builder Sandwich
 */

/**
Plugin Name: Page Builder Sandwich
Description: The easiest way to build your website without any code. A true drag & drop page builder for WordPress.
Author: Gambit Technologies
Version: 3.3
Author URI: http://gambit.ph
Plugin URI: http://pagebuildersandwich.com
Text Domain: page-builder-sandwich
Domain Path: /languages/
SKU: PBS
 */


if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

/**
 * Detect if there is another version of PBS currently activated. If there is,
 * show an error since multiple plugins will cause errors.
 */
if ( defined( 'VERSION_PAGE_BUILDER_SANDWICH' ) ) {
	trigger_error( 'Seems like you have the Lite version of Page Builder Sandwich activated. Please deactivate it first then try again.', E_USER_ERROR );
	return;
}

// Identifies the current plugin version.
defined( 'VERSION_PAGE_BUILDER_SANDWICH' ) or define( 'VERSION_PAGE_BUILDER_SANDWICH', '3.3' );

// The slug used for translations & other identifiers.
defined( 'PAGE_BUILDER_SANDWICH' ) or define( 'PAGE_BUILDER_SANDWICH', 'page-builder-sandwich' );

defined( 'PBS_FILE' ) or define( 'PBS_FILE', __FILE__ );

// Shows/hides Lite code.
define( 'PBS_IS_LITE', true );

// Shows/hides Pro code.
define( 'PBS_IS_PRO', false );

if ( ! function_exists( 'pbs_is_dev' ) ) {
	/**
	 * Returns true if we are in development mode and not in a built copy.
	 *
	 * @since 2.18
	 *
	 * @return boolean True if we are developing.
	 */
	function pbs_is_dev() {
		if ( defined( 'WP_DEBUG' ) ) {
			if ( WP_DEBUG ) {
				return file_exists( trailingslashit( plugin_dir_path( __FILE__ ) ) . '_design-element-cleanup.php' );
			}
		}
		return false;
	}
}

// Freemius stuff.
require_once( 'class-freemius.php' );
require_once( 'module-migration.php' );

// This is the main plugin functionality.
require_once( 'class-compatibility.php' );
require_once( 'class-render-shortcode.php' );
require_once( 'class-page-builder-sandwich.php' );
require_once( 'class-migration.php' );
require_once( 'class-intro.php' );
require_once( 'class-meta-box.php' );
require_once( 'class-icons.php' );
require_once( 'class-helpscout.php' );
require_once( 'class-stats-tracking.php' );
require_once( 'class-shortcodes.php' );
require_once( 'class-element-widget.php' );
require_once( 'class-element-sidebar.php' );
require_once( 'class-element-html.php' );
require_once( 'class-element-map.php' );
require_once( 'class-translations.php' );
require_once( 'class-shortcode-mapper.php' );
require_once( 'class-shortcode-mapper-3rd-party.php' );
require_once( 'class-inspector.php' );
require_once( 'class-frame-admin.php' );
require_once( 'class-heartbeat.php' );
require_once( 'class-ask-rating.php' );
require_once( 'class-admin-welcome.php' );
require_once( 'class-title.php' );

global $pbs_fs;
if ( ! PBS_IS_LITE && $pbs_fs->can_use_premium_code() ) {
	require_once( 'class-icons-uploader.php' );
	require_once( 'class-element-newsletter.php' );
	require_once( 'class-element-carousel.php' );
	require_once( 'class-element-pretext.php' );
}

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

			// Put a notice on how to edit using PBS.
			add_action( 'admin_notices', array( $this, 'plugin_activation_notice' ) );

			// Add edit with PBS links to posts & pages.
			add_filter( 'post_row_actions', array( $this, 'add_pbs_edit_link' ), 10, 2 );
			add_filter( 'page_row_actions', array( $this, 'add_pbs_edit_link' ), 10, 2 );

			new PBSMigration();
		}


		/**
		 * Loads the translations.
		 *
		 * @return	void
		 * @since	1.0
		 */
		public function load_text_domain() {
			load_plugin_textdomain( PAGE_BUILDER_SANDWICH, false, basename( dirname( __FILE__ ) ) . '/languages/' );
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

				global $pbs_fs;
				if ( PBS_IS_LITE || ! $pbs_fs->can_use_premium_code() ) {
					$plugin_meta[] = sprintf( "<a href='%s' target='_blank'>%s</a>",
						esc_url( admin_url( '/admin.php?page=page-builder-sandwich-pricing' ) ),
						__( 'Go Premium', PAGE_BUILDER_SANDWICH )
					);
				} else {
					$plugin_meta[] = sprintf( "<a href='%s' target='_blank' class='pbs-plugin-placeholder'>%s</a>",
						esc_url( admin_url( '/admin.php?page=page-builder-sandwich-contact' ) ),
						__( 'Get Customer Support', PAGE_BUILDER_SANDWICH )
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

				if ( pbs_is_dev() ) {
					$plugin_meta[] = sprintf( "<br><a href='%s' target='_blank'>%s</a>",
						plugins_url( '_design-element-cleanup.php', __FILE__ ),
						'[DEV TOOL] Pre-Designed Element HTML Cleaner'
					);
				}
			}
			return $plugin_meta;
		}


		/**
		 * Displays a notice for first time users to create a new page/post to start using PBS.
		 *
		 * @since 2.8.1
		 */
		public function plugin_activation_notice() {
			if ( get_option( 'pbs_plugin_activation_notice' ) === false ) {

				// Only show this once.
				update_option( 'pbs_plugin_activation_notice', 'done' );

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
							<form action='post.php' method='post' id='pbs-new-post' name='post' target='_self'>
								<input type='hidden' id='title' name='post_title' value='<?php echo esc_attr( 'Just Trying Out PBS', PAGE_BUILDER_SANDWICH ) ?>'/>
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
									esc_html__( "Thanks for activating Page Builder Sandwich! To get started, visit any page or post in your site. %sOr let's create a new %s right now and I'll tour you on how to use PB Sandwich.%s (This will create a new draft %s)", PAGE_BUILDER_SANDWICH ),
									'<a href="' . esc_url( $preview_link ) . '" onclick="document.getElementById(\'pbs-new-post\').submit(); return false;">',
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
							<?php esc_html_e( 'Thanks for activating Page Builder Sandwich! To get started, visit any page or post in your site to begin using Page Builder Sandwich. You will need to have editing privileges to edit them.', PAGE_BUILDER_SANDWICH ) ?>
						</p>
					</div>
					<?php
				}
			}
		}


		/**
		 * Adds "Edit with PBS" links to posts, pages and CPTs.
		 * Will only add a link to viewable post types.
		 *
		 * @since 3.1
		 *
		 * @param array   $actions The list of links for this post.
		 * @param WP_Post $post The current post.
		 *
		 * @return array The list of links to display.
		 */
		public function add_pbs_edit_link( $actions, $post ) {
			$post_type_object = get_post_type_object( $post->post_type );
			$can_edit_post = current_user_can( 'edit_post', $post->ID );

			if ( is_post_type_viewable( $post_type_object ) ) {
				if ( in_array( $post->post_status, array( 'pending', 'draft', 'future' ), true ) ) {
					if ( $can_edit_post ) {
						$actions['edit_pbs'] = sprintf( '<a href="%s" title="%s" onclick="localStorage.setItem( \'pbs-open-%d\', \'1\' )">%s</a>',
							esc_url( get_preview_post_link( $post ) ),
							esc_attr__( 'Edit with Page Builder Sandwich', PAGE_BUILDER_SANDWICH ),
							absint( $post->ID ),
							esc_html__( 'Edit with Page Builder Sandwich', PAGE_BUILDER_SANDWICH )
						);
					}
				} elseif ( 'trash' !== $post->post_status ) {
					$actions['edit_pbs'] = sprintf( '<a href="%s" title="%s" onclick="localStorage.setItem( \'pbs-open-%d\', \'1\' )">%s</a>',
						esc_url( get_permalink( $post->ID ) ),
						esc_attr__( 'Edit with Page Builder Sandwich', PAGE_BUILDER_SANDWICH ),
						absint( $post->ID ),
						esc_html__( 'Edit with Page Builder Sandwich', PAGE_BUILDER_SANDWICH )
					);
				}
			}

			return $actions;
		}
	}

	new PageBuilderSandwichPlugin();
}
