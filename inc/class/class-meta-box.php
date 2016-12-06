<?php
/**
 * Meta box in the post/page editor in the backend.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbMetaBox' ) ) {

	/**
	 * This is where all the meta box functionality happens.
	 */
	class nhbMetaBox {

		/**
		 * Hook into the backend.
		 */
		function __construct() {
			if ( ! is_admin() ) {
				return;
			}

			add_filter( 'nhb_localize_admin_scripts', array( $this, 'localize_admin_scripts' ) );
			add_action( 'add_meta_boxes', array( $this, 'add_side_meta_box' ), 0 );
		}


		/**
		 * Add the JS params we need for the meta box to work.
		 *
		 * @since 2.9
		 *
		 * @param array $params Localization parameters.
		 *
		 * @return array The modified parameters.
		 */
		public function localize_admin_scripts( $params ) {

			$screen = get_current_screen();
			if ( 'post' !== $screen->base ) {
				return $params;
			}

			$params['is_editing'] = true;
			$params['meta_is_page'] = 'page' === $screen->id;
			$params['meta_not_saved'] = get_post_status() === 'auto-draft';
			$params['meta_permalink'] = get_permalink();

			global $post;
			if ( $post ) {
				$params['post_id'] = $post->ID;
			}
			return $params;
		}


		/**
		 * Adds the sidebar meta box in pages and posts.
		 *
		 * @since 2.9
		 */
		public function add_side_meta_box() {
			$is_saved = get_post_status() !== 'auto-draft';
			$callback = $is_saved ? 'meta_box_content_saved' : 'meta_box_content_not_saved';
			add_meta_box( 'nhb-meta-box', 'No Hassle Builder', array( $this, $callback ), 'post', 'side', 'high' );
			add_meta_box( 'nhb-meta-box', 'No Hassle Builder', array( $this, $callback ), 'page', 'side', 'high' );
		}


		/**
		 * The meta box contents for auto-draft posts.
		 *
		 * @since 2.9
		 */
		public function meta_box_content_not_saved() {
			$post_type = get_post_type_object( get_post_type() );
			if ( empty( $post_type ) ) {
				return;
			}
			?>
			<p>
				<em>
					<?php
					printf(
						esc_html__( 'You will need to save your %s first before you can edit it with No Hassle Builder.', NO_HASSLE_BUILDER ),
						esc_html__( strtolower( $post_type->labels->singular_name ) )
					);
					?>
				</em>
			</p>
			<?php
		}


		/**
		 * The meta box contents for saved posts.
		 *
		 * @since 2.9
		 */
		public function meta_box_content_saved() {
			$post_type = get_post_type_object( get_post_type() );
			?>
			<p>
				<em>
					<?php
					printf(
						esc_html__( 'Visit this %s in your front-end to begin editing.', NO_HASSLE_BUILDER ),
						esc_html__( strtolower( $post_type->labels->singular_name ) )
					);
					?>
				</em>
			</p>
			<input value='<?php echo esc_attr( __( 'Edit with No Hassle Builder', NO_HASSLE_BUILDER ) ) ?>' type='button' id='nhb-admin-edit-with-nhb' class='button button-large'/>
			<?php
		}
	}
}

new nhbMetaBox();
