<?php
/**
 * Ask rating after a long time of usage.
 *
 * Ask when:
 * - After 5 hours of editing time.
 * - After editing 5 pages/posts.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbAskRating' ) ) {

	/**
	 * This is where all the tracking functionality happens.
	 */
	class nhbAskRating {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {

			$asked_editing_time = get_option( 'nhb_asked_rate_editing_time' );
			$asked_edited_posts = get_option( 'nhb_asked_rate_edited_posts' );
			$has_rated = get_option( 'nhb_has_rated' );

			if ( $has_rated ) {
				return;
			}
			if ( $asked_editing_time && $asked_edited_posts ) {
				return;
			}

			// Checks whether we need to ask for a rating.
			add_filter( 'heartbeat_received', array( $this, 'check_if_need_to_ask_for_rating' ), 10, 2 );

			// Handler for when the user clicked on "rate".
			add_action( 'wp_ajax_nhb_ask_rating_rated', array( $this, 'rated' ) );

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

				$asked_editing_time = get_option( 'nhb_asked_rate_editing_time' );
				$asked_edited_posts = get_option( 'nhb_asked_rate_edited_posts' );
				$has_rated = get_option( 'nhb_has_rated' );

				if ( $has_rated ) {
					return $response;
				}
				if ( $asked_editing_time && $asked_edited_posts ) {
					return $response;
				}

				// Update the number of seconds nhb has been used.
				if ( ! $asked_editing_time ) {
					$seconds = (int) get_option( 'nhb_ask_total_editing_time' ) + 15;
					update_option( 'nhb_ask_total_editing_time', $seconds );

					if ( $seconds > 18000 ) {
						$response['ask_for_rating'] = __( 'Hey, I noticed you&apos;ve been building your pages for 5 hours already! Please do us a huge favor and give a rating for No Hassle Builder on WordPress. This will help spread the word, and help us provide more features.', NO_HASSLE_BUILDER );
						update_option( 'nhb_asked_rate_editing_time', '1' );
					}
				}

				// Update the number of posts that we have edited.
				if ( ! $asked_edited_posts ) {
					$posts_edited = get_option( 'nhb_ask_posts_edited' );
					if ( ! $posts_edited ) {
						$posts_edited = array();
					}
					if ( ! in_array( $data['post_id'], $posts_edited, true ) ) {
						$posts_edited[] = $data['post_id'];
						update_option( 'nhb_ask_posts_edited', $posts_edited );
					}

					if ( count( $posts_edited ) >= 5 ) {
						$response['ask_for_rating'] = __( 'Hey, I noticed you&apos;ve edited 5 pages already! Please do us a huge favor and give a rating for No Hassle Builder on WordPress. This will help spread the word, and help us provide more features.', NO_HASSLE_BUILDER );
						update_option( 'nhb_asked_rate_edited_posts', '1' );
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
			if ( ! wp_verify_nonce( $nonce, 'nhb' ) ) {
				die();
			}

			update_option( 'nhb_has_rated', true );

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
			if ( ! NoHassleBuilder::is_editable_by_user() ) {
				return $wp_admin_bar;
			}

			$args = array(
				'id' => 'nhb_rate',
				'title' => '<span class="ab-icon"></span>'
					. __( 'Rate PB Sandwich!', NO_HASSLE_BUILDER )
					. '<span id="nhb-rate-info">'
					. '<span id="nhb-rate-desc"></span>'
					. '<span id="nhb-rate-go">' . __( "Awesome, I'll Rate", NO_HASSLE_BUILDER )
					. '</span><span id="nhb-rate-no">' . __( 'Later', NO_HASSLE_BUILDER ) . '</span>',
				'href'  => '#',
				'meta'  => array( 'class' => 'nhb-adminbar-icon nhb-hidden' ),
			);
			$wp_admin_bar->add_node( $args );

			return $wp_admin_bar;
		}
	}
}

new nhbAskRating();
