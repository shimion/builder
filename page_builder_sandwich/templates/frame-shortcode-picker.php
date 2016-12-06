<?php
/**
 * Template file for the shortcode picker modal popup.
 *
 * @package Page Builder Sandwich
 */

global $pbs_fs;
?>
<script type="text/html" id="tmpl-pbs-shortcode-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', PAGE_BUILDER_SANDWICH ), __( 'Shortcode', PAGE_BUILDER_SANDWICH ) ) ) ?>" id="pbs-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content pbs-search-list-frame">
		<div class="pbs-search-list">
			<div class="pbs-no-results"><?php esc_html_e( 'No matches found', PAGE_BUILDER_SANDWICH ) ?></div>
		</div>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
				<p>
					<?php
					$total_label = esc_html__( 'hundreds of plugins', PAGE_BUILDER_SANDWICH );
					if ( get_option( 'pbs_shortcode_mapped_plugins_total' ) ) {
						$total_label = sprintf( esc_html__( '%s plugins', PAGE_BUILDER_SANDWICH ), number_format( intval( get_option( 'pbs_shortcode_mapped_plugins_total' ) ) ) );
					}
					$total_sc_label = esc_html__( 'hundreds of shortcodes', PAGE_BUILDER_SANDWICH );
					if ( get_option( 'pbs_shortcode_mapped_shortcodes_total' ) ) {
						$total_sc_label = sprintf( esc_html__( '%s shortcodes', PAGE_BUILDER_SANDWICH ), number_format( intval( get_option( 'pbs_shortcode_mapped_shortcodes_total' ) ) ) );
					}

					esc_html_e( 'Tip: You can also type in shortcodes directly in the content.', PAGE_BUILDER_SANDWICH );
					if ( PBS_IS_LITE || ! $pbs_fs->can_use_premium_code() ) {
						echo '<br><strong>';
						printf( __( 'The lite version only provides simple text fields for all mapped shortcodes. The %sPremium version%s has more controls like image pickers, switched, post drop downs and color pickers. We have %s and %s in the mapping database.', PAGE_BUILDER_SANDWICH ), '<a href="http://pagebuildersandwich.com" target="_blank">', '</a>', $total_label, $total_sc_label ); // WPCS: XSS ok.
						echo '</strong>';
					} else {
						echo '<br><strong>';
						printf( esc_html__( 'Fun fact: There are a total of %s and %s in our shortcode mapping database.', PAGE_BUILDER_SANDWICH ), $total_label, $total_sc_label ); // WPCS: XSS ok.
						echo '</strong>';
					}
					?>

					<br>
					<a href="#" class="pbs-refresh-mappings"><?php esc_html_e( 'Click here to refresh shortcode mappings from the database', PAGE_BUILDER_SANDWICH ) ?></a>
				</p>
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large"><?php esc_html_e( 'Insert Selected Shortcode', PAGE_BUILDER_SANDWICH ) ?></button>
			</div>
		</div>
	</div>
</script>
