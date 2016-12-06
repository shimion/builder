<?php
/**
 * Template file for the shortcode picker modal popup.
 *
 * @package No Hassle Builder
 */

global $nhb_fs;
?>
<script type="text/html" id="tmpl-nhb-shortcode-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', NO_HASSLE_BUILDER ), __( 'Shortcode', NO_HASSLE_BUILDER ) ) ) ?>" id="nhb-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content nhb-search-list-frame">
		<div class="nhb-search-list">
			<div class="nhb-no-results"><?php esc_html_e( 'No matches found', NO_HASSLE_BUILDER ) ?></div>
		</div>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
				<p>
					<?php
					$total_label = esc_html__( 'hundreds of plugins', NO_HASSLE_BUILDER );
					if ( get_option( 'nhb_shortcode_mapped_plugins_total' ) ) {
						$total_label = sprintf( esc_html__( '%s plugins', NO_HASSLE_BUILDER ), number_format( intval( get_option( 'nhb_shortcode_mapped_plugins_total' ) ) ) );
					}
					$total_sc_label = esc_html__( 'hundreds of shortcodes', NO_HASSLE_BUILDER );
					if ( get_option( 'nhb_shortcode_mapped_shortcodes_total' ) ) {
						$total_sc_label = sprintf( esc_html__( '%s shortcodes', NO_HASSLE_BUILDER ), number_format( intval( get_option( 'nhb_shortcode_mapped_shortcodes_total' ) ) ) );
					}

					esc_html_e( 'Tip: You can also type in shortcodes directly in the content.', NO_HASSLE_BUILDER );
					if ( nhb_IS_LITE || ! $nhb_fs->can_use_premium_code() ) {
						echo '<br><strong>';
						printf( __( 'The lite version only provides simple text fields for all mapped shortcodes. The %sPremium version%s has more controls like image pickers, switched, post drop downs and color pickers. We have %s and %s in the mapping database.', NO_HASSLE_BUILDER ), '<a href="http://pagebuildersandwich.com" target="_blank">', '</a>', $total_label, $total_sc_label ); // WPCS: XSS ok.
						echo '</strong>';
					} else {
						echo '<br><strong>';
						printf( esc_html__( 'Fun fact: There are a total of %s and %s in our shortcode mapping database.', NO_HASSLE_BUILDER ), $total_label, $total_sc_label ); // WPCS: XSS ok.
						echo '</strong>';
					}
					?>

					<br>
					<a href="#" class="nhb-refresh-mappings"><?php esc_html_e( 'Click here to refresh shortcode mappings from the database', NO_HASSLE_BUILDER ) ?></a>
				</p>
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large"><?php esc_html_e( 'Insert Selected Shortcode', NO_HASSLE_BUILDER ) ?></button>
			</div>
		</div>
	</div>
</script>
