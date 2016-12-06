<?php
/**
 * Ask rating after a long time of usage.
 *
 * Ask when:
 * - After 5 hours of editing time.
 * - After editing 5 pages/posts.
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'PBSAskRating' ) ) {

	/**
	 * This is where all the tracking functionality happens.
	 */
	class PBSAskRating {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {

			$asked_editing_time = get_option( 'pbs_asked_rate_editing_time' );
			$asked_edited_posts = get_option( 'pbs_asked_rate_edited_posts' );
			$has_rated = get_option( 'pbs_has_rated' );

			if ( $has_rated ) {
				return;
			}
			if ( $asked_editing_time && $asked_edited_posts ) {
				return;
			}

			// Checks whether we need to ask for a rating.
			add_filter( 'heartbeat_received', array( $this, 'check_if_need_to_ask_for_rating' ), 10, 2 );

			// Handler for when the user clicked on "rate".
			add_action( 'wp_ajax_pbs_ask_rating_rated', array( $this, 'rated' ) );

			// Add our rate button in the front end.
			if ( ! is_admin() ) {
				add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_rate_button' ), 9999 );
			}
		}


		/**
		 * Triggered during normal heartbeat nonce checking, track the amount of
		 * time editing.
		 *
		 * @since 3.2
		 *
		 * @param array $response The heartbeat response.
		 * @param array $data The heartbeat data sent to the server.
		 *
		 * @return array The heartbeat response
		 */
		public function check_if_need_to_ask_for_rating( $response, $data ) {
			if ( ! empty( $data['tracking_interval'] ) && ! empty( $data['post_id'] ) ) {

				$asked_editing_time = get_option( 'pbs_asked_rate_editing_time' );
				$asked_edited_posts = get_option( 'pbs_asked_rate_edited_posts' );
				$has_rated = get_option( 'pbs_has_rated' );

				if ( $has_rated ) {
					return $response;
				}
				if ( $asked_editing_time && $asked_edited_posts ) {
					return $response;
				}

				// Update the number of seconds PBS has been used.
				if ( ! $asked_editing_time ) {
					$seconds = (int) get_option( 'pbs_ask_total_editing_time' ) + 15;
					update_option( 'pbs_ask_total_editing_time', $seconds );

					if ( $seconds > 18000 ) {
						$response['ask_for_rating'] = __( 'Hey, I noticed you&apos;ve been building your pages for 5 hours already! Please do us a huge favor and give a rating for Page Builder Sandwich on WordPress. This will help spread the word, and help us provide more features.', PAGE_BUILDER_SANDWICH );
						update_option( 'pbs_asked_rate_editing_time', '1' );
					}
				}

				// Update the number of posts that we have edited.
				if ( ! $asked_edited_posts ) {
					$posts_edited = get_option( 'pbs_ask_posts_edited' );
					if ( ! $posts_edited ) {
						$posts_edited = array();
					}
					if ( ! in_array( $data['post_id'], $posts_edited, true ) ) {
						$posts_edited[] = $data['post_id'];
						update_option( 'pbs_ask_posts_edited', $posts_edited );
					}

					if ( count( $posts_edited ) >= 5 ) {
						$response['ask_for_rating'] = __( 'Hey, I noticed you&apos;ve edited 5 pages already! Please do us a huge favor and give a rating for Page Builder Sandwich on WordPress. This will help spread the word, and help us provide more features.', PAGE_BUILDER_SANDWICH );
						update_option( 'pbs_asked_rate_edited_posts', '1' );
					}
				}
			}
			return $response;
		}


		/**
		 * Rated click ajax handler.
		 *
		 * @since 2.8.2
		 */
		public function rated() {
			if ( empty( $_POST['nonce'] ) ) { // Input var: okay.
				die();
			}
			$nonce = sanitize_key( $_POST['nonce'] ); // Input var: okay.
			if ( ! wp_verify_nonce( $nonce, 'pbs' ) ) {
				die();
			}

			update_option( 'pbs_has_rated', true );

			die();
		}


		/**
		 * Adds the rate box to the admin bar.
		 *
		 * @since 2.8.2
		 *
		 * @param Object $wp_admin_bar The admin bar object.
		 *
		 * @return Object The modified admin bar object.
		 */
		public function add_admin_bar_rate_button( $wp_admin_bar ) {
			if ( ! PageBuilderSandwich::is_editable_by_user() ) {
				return $wp_admin_bar;
			}

			$args = array(
				'id' => 'pbs_rate',
				'title' => '<span class="ab-icon"></span>'
					. __( 'Rate PB Sandwich!', PAGE_BUILDER_SANDWICH )
					. '<span id="pbs-rate-info">'
					. '<span id="pbs-rate-desc"></span>'
					. '<span id="pbs-rate-go">' . __( "Awesome, I'll Rate", PAGE_BUILDER_SANDWICH )
					. '</span><span id="pbs-rate-no">' . __( 'Later', PAGE_BUILDER_SANDWICH ) . '</span>',
				'href'  => '#',
				'meta'  => array( 'class' => 'pbs-adminbar-icon pbs-hidden' ),
			);
			$wp_admin_bar->add_node( $args );

			return $wp_admin_bar;
		}
	}
}

new PBSAskRating();
