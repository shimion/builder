<?php
/**
 * We put all translations here.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbTranslations' ) ) {

	/**
	 * This is where all the strings are inputted.
	 */
	class nhbTranslations {

		/**
		 * Hook into the frontend.
		 */
		function __construct() {
			add_filter( 'nhb_localize_scripts', array( $this, 'add_labels' ) );
			add_filter( 'nhb_error_notice_localize_scripts', array( $this, 'add_error_labels' ) );
		}

		/**
		 * Add our translatable text.
		 *
		 * @since 2.13
		 *
		 * @param array $args Localization array.
		 *
		 * @return array The modified localization array.
		 */
		public function add_labels( $args ) {

			$args['labels'] = array(

				// Used in _element-html.js.
				'html_frame_button' => __( 'Save HTML', NO_HASSLE_BUILDER ),

				// Used in _element-icon.js.
				'icon_frame_change_title' => __( 'Change Icon', NO_HASSLE_BUILDER ),
				'icon_frame_change_button' => __( 'Change Icon', NO_HASSLE_BUILDER ),

				// Used in _element-newsletter.js.
				'newsletter_default_button' => __( 'Subscribe', NO_HASSLE_BUILDER ),

				// Used in _get-premium.js.
				'get_the_premium_plugin' => __( 'Get the Premium Plugin to get more tools and features', NO_HASSLE_BUILDER ),

				// Used in _inspector-newsletter.js.
				'newsletter' => __( 'Newsletter', NO_HASSLE_BUILDER ),
				'show_button_when_typed_on' => __( 'Show Button When Typed On', NO_HASSLE_BUILDER ),
				'error_message_color' => __( 'Error Message Color', NO_HASSLE_BUILDER ),
				'success_message_color' => __( 'Success Message Color', NO_HASSLE_BUILDER ),
				'success_message' => __( 'Success Message', NO_HASSLE_BUILDER ),
				'thank_you_for_subscribing' => __( 'Thank you for subscribing!', NO_HASSLE_BUILDER ),
				'newsletter_service' => __( 'Newsletter Service', NO_HASSLE_BUILDER ),
				'newsletter_settings' => __( 'Newsletter Settings', NO_HASSLE_BUILDER ),
				'mailchimp_api_key' => __( 'MailChimp API Key', NO_HASSLE_BUILDER ),
				'get_mailchimp_api_key' => __( 'Get your MailChimp API Key', NO_HASSLE_BUILDER ),
				'mailchimp_list_key' => __( 'MailChimp List Key', NO_HASSLE_BUILDER ),
				'get_mailchimp_list_key' => __( 'Get your MailChimp List Key', NO_HASSLE_BUILDER ),
				'aweber_list_id' => __( 'AWeber List ID', NO_HASSLE_BUILDER ),
				'get_aweber_list_id' => __( 'Get your AWeber List ID', NO_HASSLE_BUILDER ),
				'mailpoet_list' => __( 'MailPoet List', NO_HASSLE_BUILDER ),

				// Used in _inspector-options.js.
				'widget_properties_title' => __( '%s Widget Properties', NO_HASSLE_BUILDER ),

				// Used in _inspector-sidebar.js.
				'sidebar_inspector_desc' => __( 'Add a sidebar or widget area', NO_HASSLE_BUILDER ),
				'select_a_sidebar' => __( 'Select a Sidebar', NO_HASSLE_BUILDER ),

				// Used in _inspector-widgets.js.
				'widget_inspector_desc' => __( 'Add a WordPress widget', NO_HASSLE_BUILDER ),

				// Used in _inspector.js.
				'shortcodes_not_attributes_detected' => __( 'No attributes or content detected', NO_HASSLE_BUILDER ),
				'no_attributes_available' => __( 'No attributes available.', NO_HASSLE_BUILDER ),
				'inspector_title' => __( '%s Properties', NO_HASSLE_BUILDER ),
				'note_options_are_detected' => __( 'Options are detected from usage of this shortcode', NO_HASSLE_BUILDER ),
				'note_shortcode_not_appearing' => __( "Note: If the element doesn't show up, you may need to refresh the page.", NO_HASSLE_BUILDER ),

				// Used in _nhb-intro.js.
				// TODO continue adding this.
				// 'tour_intro_title' => __( "Hello! I See You're New to No Hassle Builder", NO_HASSLE_BUILDER ),
				// 'tour_intro_body' => __( 'This quick tour will teach you how to get started. Click the <strong>Edit button</strong> above to start editing this page.', NO_HASSLE_BUILDER ),
				// 'tour_content_area_title' => __( 'Your Content Area', NO_HASSLE_BUILDER ),
				// 'tour_content_area_body' => __( 'In No Hassle Builder, everything is simple. This is your content area, and you can start typing right away to start building your site.<br><br><em>Go ahead and type the word "<strong>Sandwich</strong>" to proceed.</em>', NO_HASSLE_BUILDER ),
				// 'tour_inspector_title' => __( 'This Is the Inspector', NO_HASSLE_BUILDER ),
				// 'tour_inspector_body' => __( "This panel area contains all the styling tools that you'll ever need. Each icon is a button that you can click to apply styles on the item you have currently selected.<br><br>Hover your mouse over each tool to get a description of what they do. Some even have shortcut keys that you can perform to quickly apply them.<br><br><em>Go hover your mouse over the text formatting buttons on the top part to proceed.</em>", NO_HASSLE_BUILDER ),
				// 'tour_done_title' => __( "That's It!", NO_HASSLE_BUILDER ),
				// 'tour_done_body' => __( "Finally, when you're done editing, click on this save button to finalize your changes.", NO_HASSLE_BUILDER ),
				// Used in _nhb-stats-tracking.js.
				'optin_error' => __( 'Communication error, please refresh the page and try again', NO_HASSLE_BUILDER ),

				// Inspector labels.
				'properties_inspector' => __( 'Properties Inspector', NO_HASSLE_BUILDER ),
				'general' => __( 'General', NO_HASSLE_BUILDER ),
				'input_field' => __( 'Input Field', NO_HASSLE_BUILDER ),
				'edit_link' => sprintf( __( 'Edit %s', NO_HASSLE_BUILDER ), __( 'Link', NO_HASSLE_BUILDER ) ),
				'button_padding' => __( 'Button Padding', NO_HASSLE_BUILDER ),
				'desc_button_padding' => __( 'Use this to make your button larger.', NO_HASSLE_BUILDER ),
				'pick_an_icon' => __( 'Pick an icon', NO_HASSLE_BUILDER ),
				'button_color' => __( 'Button Color', NO_HASSLE_BUILDER ),
				'button_text_color' => __( 'Button Text Color', NO_HASSLE_BUILDER ),
				'vertical_padding' => __( 'Vertical Padding', NO_HASSLE_BUILDER ),
				'horizontal_padding' => __( 'Horizontal Padding', NO_HASSLE_BUILDER ),
				'ghost_button_style' => __( 'Ghost Button Style', NO_HASSLE_BUILDER ),
				'desc_ghost_button' => __( 'Turn your button into a ghost button. Ghost buttons are outlined buttons that blend into your design.', NO_HASSLE_BUILDER ),
				'choose_button_icon' => __( 'Choose Button Icon', NO_HASSLE_BUILDER ),
				'button_icon' => __( 'Button Icon', NO_HASSLE_BUILDER ),
				'use_icon' => __( 'Use Icon', NO_HASSLE_BUILDER ),
				'icon_color' => __( 'Icon Color', NO_HASSLE_BUILDER ),
				'move' => __( 'Move', NO_HASSLE_BUILDER ),
				'move_carousel' => sprintf( __( 'Move %s', NO_HASSLE_BUILDER ), __( 'Carousel', NO_HASSLE_BUILDER ) ),
				'move_left' => __( 'Move Left', NO_HASSLE_BUILDER ),
				'move_right' => __( 'Move Right', NO_HASSLE_BUILDER ),
				'default' => __( 'Default', NO_HASSLE_BUILDER ),
				'inside_left' => __( 'Inside Left', NO_HASSLE_BUILDER ),
				'inside_center' => __( 'Inside Center', NO_HASSLE_BUILDER ),
				'inside_right' => __( 'Inside Right', NO_HASSLE_BUILDER ),
				'icon_size' => __( 'Icon Size', NO_HASSLE_BUILDER ),
				'full_height' => __( 'Full Height', NO_HASSLE_BUILDER ),
				'full_width' => __( 'Full-Width', NO_HASSLE_BUILDER ),
				'normal_width' => __( 'Normal Width', NO_HASSLE_BUILDER ),
				'full_height' => __( 'Full-Height', NO_HASSLE_BUILDER ),
				'automatic_height' => __( 'Automatic Height', NO_HASSLE_BUILDER ),
				'move_slide_left' => __( 'Move Slide Left', NO_HASSLE_BUILDER ),
				'slides' => __( 'Slides', NO_HASSLE_BUILDER ),
				'move_slide_right' => __( 'Move Slide Right', NO_HASSLE_BUILDER ),
				'remove_slide' => sprintf( __( 'Remove %s', NO_HASSLE_BUILDER ), __( 'Slide', NO_HASSLE_BUILDER ) ),
				'add_slide' => sprintf( __( 'Add %s', NO_HASSLE_BUILDER ), __( 'Slide', NO_HASSLE_BUILDER ) ),
				'clone_slide' => sprintf( __( 'Clone %s', NO_HASSLE_BUILDER ), __( 'Slide', NO_HASSLE_BUILDER ) ),
				'bullet' => __( 'Bullet', NO_HASSLE_BUILDER ),
				'bullet_color' => __( 'Bullet Color', NO_HASSLE_BUILDER ),
				'bullets' => __( 'Bullets', NO_HASSLE_BUILDER ),
				'bullet_location' => __( 'Bullet Location', NO_HASSLE_BUILDER ),
				'slide_delay' => __( 'Slide Delay', NO_HASSLE_BUILDER ),
				'embedded_url' => __( 'Embedded URL', NO_HASSLE_BUILDER ),
				'delete' => __( 'Delete', NO_HASSLE_BUILDER ),
				'delete_carousel' => sprintf( __( 'Delete %s', NO_HASSLE_BUILDER ), __( 'Carousel', NO_HASSLE_BUILDER ) ),
				'row_width' => __( 'Row Width', NO_HASSLE_BUILDER ),
				'desc_row_width' => __( 'Let your row occupy the whole browser width. This only affects the outer-most row.', NO_HASSLE_BUILDER ),
				'full_width_retained_content_width' => __( 'Full-Width Retained Content Width', NO_HASSLE_BUILDER ),
				'normal' => __( 'Normal', NO_HASSLE_BUILDER ),
				'fixed_background' => __( 'Fixed Background', NO_HASSLE_BUILDER ),
				'background_color' => __( 'Background Color', NO_HASSLE_BUILDER ),
				'background_color_focused' => __( 'Background Color (When Focused)', NO_HASSLE_BUILDER ),
				'desc_icon_tooltip' => __( 'Place something in this field to show a tooltip when the mouse is hovered on the icon.', NO_HASSLE_BUILDER ),
				'background' => __( 'Background', NO_HASSLE_BUILDER ),
				'desc_background_tint' => __( 'Add color to your background image. Use the color picker above to change the tint.', NO_HASSLE_BUILDER ),
				'background_size' => __( 'Background Size', NO_HASSLE_BUILDER ),
				'desc_background_size' => __( 'Background image size in pixels. Can be used to make your background a pattern. Use 0 (or blank) to make the background cover the whole area.', NO_HASSLE_BUILDER ),
				'image' => __( 'Image', NO_HASSLE_BUILDER ),
				'background_image' => __( 'Background Image', NO_HASSLE_BUILDER ),
				'vertical_column_alignment' => __( 'Vertical Column Alignment', NO_HASSLE_BUILDER ),
				'desc_vertical_column_alignment' => __( 'The alignment of the column vertically. Helpful if the row is tall because of other columns, and this column is short.', NO_HASSLE_BUILDER ),
				'occupy_entire_space' => __( 'Occupy entire space', NO_HASSLE_BUILDER ),
				'alignment' => __( 'Alignment', NO_HASSLE_BUILDER ),
				'vertical_content_alignment' => __( 'Vertical Content Alignment', NO_HASSLE_BUILDER ),
				'desc_vertical_content_alignment' => __( 'The alignment of the content inside this column vertically. Helpful if the column is tall and only has a short content.', NO_HASSLE_BUILDER ),
				'spread_evenly_top_to_bottom' => __( 'Spread evenly from top to bottom (space-between)', NO_HASSLE_BUILDER ),
				'equally_spaced' => __( 'Each item is equally spaced (space-around)', NO_HASSLE_BUILDER ),
				'horizontal_content_alignment' => __( 'Horizontal Content Alignment', NO_HASSLE_BUILDER ),
				'desc_horizontal_content_alignment' => __( 'The alignment of the content inside this column horizontally. Helpful for specifying alignment all at once.', NO_HASSLE_BUILDER ),
				'add_column' => sprintf( __( 'Add %s', NO_HASSLE_BUILDER ), __( 'Column', NO_HASSLE_BUILDER ) ),
				'clear_all_row_styles' => __( 'Clear All Row Styles', NO_HASSLE_BUILDER ),
				'clone_row' => sprintf( __( 'Clone %s', NO_HASSLE_BUILDER ), __( 'Row', NO_HASSLE_BUILDER ) ),
				'delete_row' => sprintf( __( 'Delete %s', NO_HASSLE_BUILDER ), __( 'Row', NO_HASSLE_BUILDER ) ),
				'clear_all_column_styles' => __( 'Clear All Column Styles', NO_HASSLE_BUILDER ),
				'row' => __( 'Row', NO_HASSLE_BUILDER ),
				'column' => __( 'Column', NO_HASSLE_BUILDER ),
				'clone_column' => sprintf( __( 'Clone %s', NO_HASSLE_BUILDER ), __( 'Column', NO_HASSLE_BUILDER ) ),
				'delete_column' => sprintf( __( 'Delete %s', NO_HASSLE_BUILDER ), __( 'Column', NO_HASSLE_BUILDER ) ),
				'desc_newsletter_success_color' => __( 'The color of the success message when someone subscribes.', NO_HASSLE_BUILDER ),
				'desc_newsletter_error_color' => __( 'The color of the error message when something went wrong.', NO_HASSLE_BUILDER ),
				'border_color' => __( 'Border Color', NO_HASSLE_BUILDER ),
				'list' => __( 'List', NO_HASSLE_BUILDER ),
				'borders' => __( 'Borders', NO_HASSLE_BUILDER ),
				'solid' => __( 'Solid', NO_HASSLE_BUILDER ),
				'dashed' => __( 'Dashed', NO_HASSLE_BUILDER ),
				'dotted' => __( 'Dotted', NO_HASSLE_BUILDER ),
				'border_style' => __( 'Border Style', NO_HASSLE_BUILDER ),
				'border_thickness' => __( 'Border Thickness', NO_HASSLE_BUILDER ),
				'border_radius' => __( 'Border Radius', NO_HASSLE_BUILDER ),
				'toggle_background_image_tint' => __( 'Toggle Background Image Tint', NO_HASSLE_BUILDER ),
				'convert_to_1_column' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), __( '1 Column', NO_HASSLE_BUILDER ) ),
				'change_columns' => sprintf( __( 'Change %s', NO_HASSLE_BUILDER ), __( 'Columns', NO_HASSLE_BUILDER ) ),
				'convert_to_even_2_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Even %d Columns', NO_HASSLE_BUILDER ), 2 ) ),
				'convert_to_uneven_2_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Uneven %d Columns', NO_HASSLE_BUILDER ), 2 ) ),
				'convert_to_even_3_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Even %d Columns', NO_HASSLE_BUILDER ), 3 ) ),
				'convert_to_uneven_3_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Uneven %d Columns', NO_HASSLE_BUILDER ), 3 ) ),
				'convert_to_even_4_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Even %d Columns', NO_HASSLE_BUILDER ), 4 ) ),
				'convert_to_uneven_4_columns' => sprintf( __( 'Convert to %s', NO_HASSLE_BUILDER ), sprintf( __( 'Uneven %d Columns', NO_HASSLE_BUILDER ), 4 ) ),
				'spacing' => __( 'Spacing', NO_HASSLE_BUILDER ),
				'column_width' => __( 'Column Width', NO_HASSLE_BUILDER ),
				'column_gap' => __( 'Column Gap', NO_HASSLE_BUILDER ),
				'custom_class' => __( 'Custom Class', NO_HASSLE_BUILDER ),
				'desc_custom_class' => __( 'Assign custom classes to this element that you can reference inside your CSS or Javascript.', NO_HASSLE_BUILDER ),
				'custom_id' => __( 'Custom ID', NO_HASSLE_BUILDER ),
				'desc_custom_id' => __( 'Assign a custom unique ID to this element that you can reference inside your CSS or Javascript.', NO_HASSLE_BUILDER ),
				'advanced' => __( 'Advanced', NO_HASSLE_BUILDER ),
				'choose_icon' => __( 'Choose Icon', NO_HASSLE_BUILDER ),
				'padding' => __( 'Padding', NO_HASSLE_BUILDER ),
				'desc_input_field_padding' => __( 'Use this to make your input field larger', NO_HASSLE_BUILDER ),
				'remove_icon' => sprintf( __( 'Remove %s', NO_HASSLE_BUILDER ), __( 'Icon', NO_HASSLE_BUILDER ) ),
				'width' => __( 'Width', NO_HASSLE_BUILDER ),
				'shadows' => __( 'Shadows', NO_HASSLE_BUILDER ),
				'shadow_strength' => __( 'Shadow Strength', NO_HASSLE_BUILDER ),
				'simple_shadow_small' => __( 'Simple Shadow Small', NO_HASSLE_BUILDER ),
				'simple_shadow_normal' => __( 'Simple Shadow Normal', NO_HASSLE_BUILDER ),
				'simple_shadow_medium' => __( 'Simple Shadow Medium', NO_HASSLE_BUILDER ),
				'simple_shadow_large' => __( 'Simple Shadow Large', NO_HASSLE_BUILDER ),
				'simple_shadow_huge' => __( 'Simple Shadow Huge', NO_HASSLE_BUILDER ),
				'shadow_fancy_bottom_tilted' => __( 'Fancy Bottom Tilted (Needs Background Color)', NO_HASSLE_BUILDER ),
				'shadow_fancy_vertical' => __( 'Fancy Vertical (Needs Background Color)', NO_HASSLE_BUILDER ),
				'shadow_fancy_horizontal' => __( 'Fancy Horizontal (Needs Background Color)', NO_HASSLE_BUILDER ),
				'shadow_fancy_center_bottom' => __( 'Fancy Center Bottom (Needs Background Color)', NO_HASSLE_BUILDER ),
				'tooltip' => __( 'Tooltip', NO_HASSLE_BUILDER ),
				'tooltip_location' => __( 'Tooltip Location', NO_HASSLE_BUILDER ),
				'toggle_shadow' => sprintf( __( 'Toggle %s', NO_HASSLE_BUILDER ), __( 'Shadow', NO_HASSLE_BUILDER ) ),
				'tooltip_text' => __( 'Tooltip Text (Shows on Hover)', NO_HASSLE_BUILDER ),
				'note_overridden_by_elements' => __( 'Note: this can be overridden by other elements.', NO_HASSLE_BUILDER ),
				'text_color' => __( 'Text Color', NO_HASSLE_BUILDER ),
				'text_color_focused' => __( 'Text Color (When Focused)', NO_HASSLE_BUILDER ),
				'text_alignment' => __( 'Text Alignment', NO_HASSLE_BUILDER ),
				'border' => __( 'Border', NO_HASSLE_BUILDER ),
				'all_sides' => __( 'All Sides', NO_HASSLE_BUILDER ),
				'top_and_bottom' => __( 'Top & Bottom', NO_HASSLE_BUILDER ),
				'left_and_right' => __( 'Left & Right', NO_HASSLE_BUILDER ),
				'top' => __( 'Top', NO_HASSLE_BUILDER ),
				'right' => __( 'Right', NO_HASSLE_BUILDER ),
				'bottom' => __( 'Bottom', NO_HASSLE_BUILDER ),
				'left' => __( 'Left', NO_HASSLE_BUILDER ),
				'none' => __( 'None', NO_HASSLE_BUILDER ),
				'all' => __( 'All', NO_HASSLE_BUILDER ),
				'center' => __( 'Center', NO_HASSLE_BUILDER ),
				'colors' => __( 'Colors', NO_HASSLE_BUILDER ),
				'placeholder_color' => __( 'Placeholder Color', NO_HASSLE_BUILDER ),
				'placeholder_color_focused' => __( 'Placeholder Color (When Focused)', NO_HASSLE_BUILDER ),
				'bullet_icon' => __( 'Bullet Icon', NO_HASSLE_BUILDER ),
				'reset_bullet_icon' => sprintf( __( 'Reset %s', NO_HASSLE_BUILDER ), __( 'Bullet Icon', NO_HASSLE_BUILDER ) ),
				'choose_bullet_icon' => sprintf( __( 'Choose %s', NO_HASSLE_BUILDER ), __( 'Bullet Icon', NO_HASSLE_BUILDER ) ),
				'use_as_bullet' => __( 'Use As Bullet', NO_HASSLE_BUILDER ),
				'font_size' => __( 'Font Size', NO_HASSLE_BUILDER ),
				'increase_font_size' => sprintf( __( 'Increase %s', NO_HASSLE_BUILDER ), __( 'Font Size', NO_HASSLE_BUILDER ) ),
				'decrease_font_size' => sprintf( __( 'Decrease %s', NO_HASSLE_BUILDER ), __( 'Font Size', NO_HASSLE_BUILDER ) ),
				'reset_font_size' => sprintf( __( 'Reset %s', NO_HASSLE_BUILDER ), __( 'Font Size', NO_HASSLE_BUILDER ) ),
				'heading_label' => __( 'Heading %d', NO_HASSLE_BUILDER ),
				'horizontal_rule' => __( 'Horizontal Rule', NO_HASSLE_BUILDER ),
				'map' => __( 'Map', NO_HASSLE_BUILDER ),
				'text' => __( 'Text', NO_HASSLE_BUILDER ),
				'insert_icon' => sprintf( __( 'Insert %s', NO_HASSLE_BUILDER ), __( 'Icon', NO_HASSLE_BUILDER ) ),
				'line_height' => __( 'Line Height', NO_HASSLE_BUILDER ),
				'increase_line_height' => sprintf( __( 'Insert %s', NO_HASSLE_BUILDER ), __( 'Line Height', NO_HASSLE_BUILDER ) ),
				'decrease_line_height' => sprintf( __( 'Decrease %s', NO_HASSLE_BUILDER ), __( 'Line Height', NO_HASSLE_BUILDER ) ),
				'reset_line_height' => sprintf( __( 'Reset %s', NO_HASSLE_BUILDER ), __( 'Line Height', NO_HASSLE_BUILDER ) ),
				'text_formatting' => __( 'Text Formatting', NO_HASSLE_BUILDER ),
				'change_type' => __( 'Change Type', NO_HASSLE_BUILDER ),
				'elements' => __( 'Elements', NO_HASSLE_BUILDER ),
				'rows_and_columns' => __( 'Rows & Columns', NO_HASSLE_BUILDER ),
				'pre_designed_sections' => __( 'Pre-Designed Sections', NO_HASSLE_BUILDER ),
				'map_controls' => __( 'Map Controls', NO_HASSLE_BUILDER ),
				'map_marker' => __( 'Map Marker', NO_HASSLE_BUILDER ),
				'custom_map_marker' => __( 'Custom Map Marker', NO_HASSLE_BUILDER ),
				'tint_map' => __( 'Tint Map', NO_HASSLE_BUILDER ),
				'latitude_longitude_and_address' => __( 'Latitude & Longitude / Address', NO_HASSLE_BUILDER ),
				'latitude_longitude_desc' => __( 'A number pair separated by a comma e.g. "37.09024, -95.712891" or enter an address', NO_HASSLE_BUILDER ),
				'custom_map_styles' => __( 'Custom Map Styles', NO_HASSLE_BUILDER ),
				'custom_map_styles_desc' => __( 'Enter custom map styles here. Read about <a href="https://developers.google.com/maps/documentation/javascript/styling#styling_the_default_map" target="_blank">Google\'s styling guide</a>. You can use sites like <a href="https://snazzymaps.com" target="_blank">SnazzyMaps.com</a> to create custom map styles.', NO_HASSLE_BUILDER ),
				'auto' => __( 'Auto', NO_HASSLE_BUILDER ),
				'move_above_s' => __( 'Move Above %s', NO_HASSLE_BUILDER ),
				'move_below_s' => __( 'Move Below %s', NO_HASSLE_BUILDER ),
				'move_inside_column' => __( 'Move Inside Column', NO_HASSLE_BUILDER ),
				'tab_style' => __( 'Tab Style', NO_HASSLE_BUILDER ),
				'tab_styles' => __( 'Tab Styles', NO_HASSLE_BUILDER ),
				'active_tab_background_color' => __( 'Active Tab Background Color', NO_HASSLE_BUILDER ),
				'active_tab_text_color' => __( 'Active Tab Text Color', NO_HASSLE_BUILDER ),
				'inactive_tab_text_color' => __( 'Inactive Tab Text Color', NO_HASSLE_BUILDER ),
				'tab_content_background_color' => __( 'Tab Content Background Color', NO_HASSLE_BUILDER ),
				'tab_content_text_color' => __( 'Tab Content Text Color', NO_HASSLE_BUILDER ),
				'overflow_hidden' => __( 'Overflow Hidden', NO_HASSLE_BUILDER ),
				'desc_overflow_hidden' => __( 'Turning this on will hide or clip elements that go outside this container.', NO_HASSLE_BUILDER ),
				'classic' => __( 'Classic', NO_HASSLE_BUILDER ),
				'clean' => __( 'Clean', NO_HASSLE_BUILDER ),
				'vertical_tabs' => __( 'Vertical tabs', NO_HASSLE_BUILDER ),
				'tab_alignment' => __( 'Tab Alignment', NO_HASSLE_BUILDER ),
				'stretch' => __( 'Stretch', NO_HASSLE_BUILDER ),
				'properties' => __( 'Properties', NO_HASSLE_BUILDER ),
				'margin' => __( 'Margin', NO_HASSLE_BUILDER ),
				'add_tab' => sprintf( __( 'Add %s', NO_HASSLE_BUILDER ), __( 'Tab', NO_HASSLE_BUILDER ) ),
				'remove_tab' => sprintf( __( 'Remove %s', NO_HASSLE_BUILDER ), __( 'Tab', NO_HASSLE_BUILDER ) ),
				'delete_tabs' => sprintf( __( 'Delete %s', NO_HASSLE_BUILDER ), __( 'Tabs', NO_HASSLE_BUILDER ) ),
				'open' => __( 'Open', NO_HASSLE_BUILDER ),
				'loading_options' => __( 'Loading Options', NO_HASSLE_BUILDER ),
				'loading_options_errored' => __( 'Error loading options', NO_HASSLE_BUILDER ),
				'insert_element' => sprintf( __( 'Insert %s', NO_HASSLE_BUILDER ), __( 'Elements', NO_HASSLE_BUILDER ) ),
				'add_element' => sprintf( __( 'Add %s', NO_HASSLE_BUILDER ), __( 'Element', NO_HASSLE_BUILDER ) ),
				'fade' => __( 'Fade', NO_HASSLE_BUILDER ),
				'fade_up' => __( 'Fade Up', NO_HASSLE_BUILDER ),
				'fade_down' => __( 'Fade Down', NO_HASSLE_BUILDER ),
				'fade_left' => __( 'Fade Left', NO_HASSLE_BUILDER ),
				'fade_right' => __( 'Fade Right', NO_HASSLE_BUILDER ),
				'fade_up_right' => __( 'Fade Up Right', NO_HASSLE_BUILDER ),
				'fade_up_left' => __( 'Fade Up Left', NO_HASSLE_BUILDER ),
				'fade_down_right' => __( 'Fade Down Right', NO_HASSLE_BUILDER ),
				'fade_down_left' => __( 'Fade Down Left', NO_HASSLE_BUILDER ),
				'flip_up' => __( 'Flip Up', NO_HASSLE_BUILDER ),
				'flip_down' => __( 'Flip Down', NO_HASSLE_BUILDER ),
				'flip_left' => __( 'Flip Left', NO_HASSLE_BUILDER ),
				'flip_right' => __( 'Flip Right', NO_HASSLE_BUILDER ),
				'roll_3d_bottom_to_top' => __( 'Roll 3D Bottom to Top', NO_HASSLE_BUILDER ),
				'roll_3d_left_to_right' => __( 'Roll 3D Left to Right', NO_HASSLE_BUILDER ),
				'roll_3d_right_to_left' => __( 'Roll 3D Right to Left', NO_HASSLE_BUILDER ),
				'spin' => __( 'Spin', NO_HASSLE_BUILDER ),
				'spin_reverse' => __( 'Spin Reverse', NO_HASSLE_BUILDER ),
				'spin_3d' => __( 'Spin 3D', NO_HASSLE_BUILDER ),
				'spin_3d_reverse' => __( 'Spin 3D Reverse', NO_HASSLE_BUILDER ),
				'slide_up' => __( 'Slide Up', NO_HASSLE_BUILDER ),
				'slide_down' => __( 'Slide Down', NO_HASSLE_BUILDER ),
				'slide_left' => __( 'Slide Left', NO_HASSLE_BUILDER ),
				'slide_right' => __( 'Slide Right', NO_HASSLE_BUILDER ),
				'rotate_top_left' => __( 'Rotate Top Left', NO_HASSLE_BUILDER ),
				'rotate_top_right' => __( 'Rotate Top Right', NO_HASSLE_BUILDER ),
				'rotate_bottom_left' => __( 'Rotate Bottom Left', NO_HASSLE_BUILDER ),
				'rotate_bottom_right' => __( 'Rotate Bottom Right', NO_HASSLE_BUILDER ),
				'zoom_in' => __( 'Zoom In', NO_HASSLE_BUILDER ),
				'zoom_in_up' => __( 'Zoom In Up', NO_HASSLE_BUILDER ),
				'zoom_in_down' => __( 'Zoom In Down', NO_HASSLE_BUILDER ),
				'zoom_in_left' => __( 'Zoom In Left', NO_HASSLE_BUILDER ),
				'zoom_in_right' => __( 'Zoom In Right', NO_HASSLE_BUILDER ),
				'zoom_out' => __( 'Zoom Out', NO_HASSLE_BUILDER ),
				'zoom_out_up' => __( 'Zoom Out Up', NO_HASSLE_BUILDER ),
				'zoom_out_down' => __( 'Zoom Out Down', NO_HASSLE_BUILDER ),
				'zoom_out_left' => __( 'Zoom Out Left', NO_HASSLE_BUILDER ),
				'zoom_out_right' => __( 'Zoom Out Right', NO_HASSLE_BUILDER ),
				'loop_pulsate' => __( 'Pulsate (Loop)', NO_HASSLE_BUILDER ),
				'loop_pulsate_fade' => __( 'Pulsate Fade (Loop)', NO_HASSLE_BUILDER ),
				'loop_hover' => __( 'Hover (Loop)', NO_HASSLE_BUILDER ),
				'loop_hover_float' => __( 'Hover Floar (Loop)', NO_HASSLE_BUILDER ),
				'loop_wobble' => __( 'Wobble (Loop)', NO_HASSLE_BUILDER ),
				'loop_wobble_3d' => __( 'Wobble 3D (Loop)', NO_HASSLE_BUILDER ),
				'loop_dangle' => __( 'Dangle (Loop)', NO_HASSLE_BUILDER ),
				'animation' => __( 'Animation', NO_HASSLE_BUILDER ),
				'desc_animation' => __( 'Play an animation when the element enters the view.', NO_HASSLE_BUILDER ),
				'animation_speed' => __( 'Animation Speed', NO_HASSLE_BUILDER ),
				'in_milliseconds' => __( 'In milliseconds', NO_HASSLE_BUILDER ),
				'animation_start_delay' => __( 'Animation Start Delay', NO_HASSLE_BUILDER ),
				'desc_animation_start_delay' => __( 'In milliseconds. Does not apply to looped animations.', NO_HASSLE_BUILDER ),
				'elastic_animation' => __( 'Elastic Animation', NO_HASSLE_BUILDER ),
				'desc_elastic_animation' => __( 'Turn this on for a bouncy/elastic animation effect.', NO_HASSLE_BUILDER ),
				'play_animation_once' => __( 'Play Animation Once', NO_HASSLE_BUILDER ),
				'desc_play_animation_once' => __( 'Animations play every time they get into view, turn this on to only play it once. Does not apply to looped animations.', NO_HASSLE_BUILDER ),
				'toggle' => __( 'Toggle', NO_HASSLE_BUILDER ),
				'fade_animation' => __( 'Fade Animation', NO_HASSLE_BUILDER ),
				'desc_fade_animation' => __( 'Check this to use fade instead of a sliding animation for each slide.', NO_HASSLE_BUILDER ),

				// Tools.
				'text_style' => __( 'Text Style', NO_HASSLE_BUILDER ),
				'heading_1' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 1 ),
				'heading_2' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 2 ),
				'heading_3' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 3 ),
				'heading_4' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 4 ),
				'heading_5' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 5 ),
				'heading_6' => sprintf( __( 'Heading %d', NO_HASSLE_BUILDER ), 6 ),
				'blockquote' => __( 'Blockquote', NO_HASSLE_BUILDER ),
				'preformatted' => __( 'Preformatted', NO_HASSLE_BUILDER ),
				'paragraph' => __( 'Paragraph', NO_HASSLE_BUILDER ),
				'button' => __( 'Button', NO_HASSLE_BUILDER ),
				'carousel' => __( 'Carousel', NO_HASSLE_BUILDER ),
				'clear_formatting' => __( 'Clear Formatting', NO_HASSLE_BUILDER ),
				'code' => __( 'Code', NO_HASSLE_BUILDER ),
				'color' => __( 'Color', NO_HASSLE_BUILDER ),
				'add_row' => sprintf( __( 'Add %s', NO_HASSLE_BUILDER ), __( 'Row', NO_HASSLE_BUILDER ) ),
				'one_column' => sprintf( __( '%s Column', NO_HASSLE_BUILDER ), 1 ),
				'two_column' => sprintf( __( '%s Columns', NO_HASSLE_BUILDER ), 2 ),
				'three_column' => sprintf( __( '%s Columns', NO_HASSLE_BUILDER ), 3 ),
				'four_column' => sprintf( __( '%s Columns', NO_HASSLE_BUILDER ), 4 ),
				'add_2_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), 2 ),
				'add_3_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), 3 ),
				'add_4_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), 4 ),
				'add_23_13_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), '2/3-1/3' ),
				'add_13_23_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), '1/3-2/3' ),
				'add_14_12_14_column_row' => sprintf( __( 'Add a %s-Column Row', NO_HASSLE_BUILDER ), '1/4-1/2-1/4' ),
				'add_n_column_row' => __( 'Add an N-Column Row', NO_HASSLE_BUILDER ),
				'html' => __( 'HTML', NO_HASSLE_BUILDER ),
				'iframe' => __( 'Iframe', NO_HASSLE_BUILDER ),
				'icon' => __( 'Icon', NO_HASSLE_BUILDER ),
				'justify' => __( 'Justify', NO_HASSLE_BUILDER ),
				'media' => __( 'Media', NO_HASSLE_BUILDER ),
				'newsletter_signup_form' => __( 'Newsletter Signup Form', NO_HASSLE_BUILDER ),
				'table' => __( 'Table', NO_HASSLE_BUILDER ),
				'shortcode' => __( 'Shortcode', NO_HASSLE_BUILDER ),
				'insert_shortcode' => __( 'Insert Shortcode', NO_HASSLE_BUILDER ),
				'undo' => __( 'Undo', NO_HASSLE_BUILDER ),
				'redo' => __( 'Redo', NO_HASSLE_BUILDER ),
				'sidebar_or_widget_area' => __( 'Sidebar or Widget Area', NO_HASSLE_BUILDER ),
				'sidebar' => __( 'Sidebar', NO_HASSLE_BUILDER ),
				'strikethrough' => __( 'Strikethrough', NO_HASSLE_BUILDER ),
				'more_tools' => __( 'More Tools', NO_HASSLE_BUILDER ),
				'less_tools' => __( 'Less Tools', NO_HASSLE_BUILDER ),
				'underline' => __( 'Underline', NO_HASSLE_BUILDER ),
				'uppercase' => __( 'Uppercase', NO_HASSLE_BUILDER ),
				'reset_case' => __( 'Reset Case', NO_HASSLE_BUILDER ),
				'insert_widget' => sprintf( __( 'Insert %s', NO_HASSLE_BUILDER ), __( 'Widget', NO_HASSLE_BUILDER ) ),
				'edit_html' => sprintf( __( 'Edit %s', NO_HASSLE_BUILDER ), __( 'HTML', NO_HASSLE_BUILDER ) ),
				'align_left' => __( 'Align left', NO_HASSLE_BUILDER ),
				'align_center' => __( 'Align center', NO_HASSLE_BUILDER ),
				'align_right' => __( 'Align right', NO_HASSLE_BUILDER ),
				'edit' => __( 'Edit', NO_HASSLE_BUILDER ),
				'align_none' => __( 'Align None', NO_HASSLE_BUILDER ),
				'edit_shortcode' => sprintf( __( 'Edit %s', NO_HASSLE_BUILDER ), __( 'Shortcode', NO_HASSLE_BUILDER ) ),
				'insert_design' => __( 'Insert Design', NO_HASSLE_BUILDER ),
				'insert_content' => __( 'Insert Content', NO_HASSLE_BUILDER ),
				'tab' => __( 'Tab', NO_HASSLE_BUILDER ),
				'tabs' => __( 'Tabs', NO_HASSLE_BUILDER ),
				's_attribute' => __( '%s attribute', NO_HASSLE_BUILDER ),
				'select_one' => __( 'Select one', NO_HASSLE_BUILDER ),
				'select_a_post_type' => __( 'Select a post type', NO_HASSLE_BUILDER ),
				'bold' => __( 'Bold', NO_HASSLE_BUILDER ),
				'italic' => __( 'Italic', NO_HASSLE_BUILDER ),
				'link' => __( 'Link', NO_HASSLE_BUILDER ),
				'bullet_list' => __( 'Bullet List', NO_HASSLE_BUILDER ),
				'numbered_list' => __( 'Numbered List', NO_HASSLE_BUILDER ),
				'indent' => __( 'Indent', NO_HASSLE_BUILDER ),
				'unindent' => __( 'Unindent', NO_HASSLE_BUILDER ),

				// Tooltips.
				'visit_link' => __( 'Visit Link', NO_HASSLE_BUILDER ),
				'edit_link' => sprintf( __( 'Edit %s', NO_HASSLE_BUILDER ), __( 'Link', NO_HASSLE_BUILDER ) ),
				'unlink' => __( 'Unlink', NO_HASSLE_BUILDER ),
				'clone' => __( 'Clone', NO_HASSLE_BUILDER ),
				'remove_column' => sprintf( __( 'Remove %s', NO_HASSLE_BUILDER ), __( 'Column', NO_HASSLE_BUILDER ) ),
				'edit_embed' => sprintf( __( 'Edit %s', NO_HASSLE_BUILDER ), __( 'Embed', NO_HASSLE_BUILDER ) ),
				'remove' => __( 'Remove', NO_HASSLE_BUILDER ),

				// Various uses.
				'sidebar' => __( 'Sidebar', NO_HASSLE_BUILDER ),
				'widget' => __( 'Widget', NO_HASSLE_BUILDER ),
				'next' => __( 'Next', NO_HASSLE_BUILDER ),
				'close' => __( 'Close', NO_HASSLE_BUILDER ),
				'select_image' => __( 'Select Image', NO_HASSLE_BUILDER ),
				'use_selected_image' => __( 'Use Selected Image', NO_HASSLE_BUILDER ),
				'your_email_address' => esc_attr( __( 'Your email address', NO_HASSLE_BUILDER ) ),
				'drag_an_element' => __( 'Drag an element below into your content', NO_HASSLE_BUILDER ),

				// Admin bar.
				'save_and_update' => __( 'Save and Update', NO_HASSLE_BUILDER ),
				'save_as_draft' => __( 'Save as Draft', NO_HASSLE_BUILDER ),
				'save_as_pending' => __( 'Save as Pending Review', NO_HASSLE_BUILDER ),

				// Lite version notes.
				'map_lite_footer' => sprintf( __( 'You can further stylize your maps with the %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=map-inspector&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ),
				'tabs_lite_footer' => sprintf( __( 'Vertical tabs and more options are available with the %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=tabs-inspector&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ),
				'icon_lite_footer' => sprintf( __( 'Get more icons, further style and add tooltips to your icons with the %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=icon-inspector&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ),
			);
			return $args;
		}


		/**
		 * Add localization scripts in the error notices.
		 *
		 * @since 2.13
		 *
		 * @param array $args Localization params.
		 *
		 * @return array Localization params.
		 */
		public function add_error_labels( $args ) {
			$args['labels'] = array(
				'toolbar_notice' => __( 'Please turn on your admin toolbar from your user profile in order for No Hassle Builder to work correctly.', NO_HASSLE_BUILDER ),
				'error_notice' => __( "There are errors on this page that may affect No Hassle Builder from working correctly. Please check the browser's console for the errors. These would need to be fixed first. Please contact the theme/plugin author", NO_HASSLE_BUILDER ),
			);
			return $args;
		}
	}
}

new nhbTranslations();
