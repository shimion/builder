<?php
/**
 * Template file for the widget picker modal popup.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-widget-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', NO_HASSLE_BUILDER ), __( 'Widget', NO_HASSLE_BUILDER ) ) ) ?>" id="nhb-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content nhb-search-list-frame">

		<div class="nhb-search-list">
			<div class="nhb-no-results"><?php esc_html_e( 'No matches found', NO_HASSLE_BUILDER ) ?></div>
			<?php
			$widgets = nhbElementWidget::gather_all_widgets();
			foreach ( $widgets as $widget_slug => $widget_info ) {
				?><div data-widget-slug="<?php echo esc_attr( $widget_slug ) ?>">
					<h4><?php echo esc_html( $widget_info['name'] ) ?></h4>
					<p><?php echo esc_html( $widget_info['description'] ) ?></p>
				</div><?php
			}
			?>
		</div>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
				<p>
					<?php esc_html_e( 'Some widgets that use specialized scripts and modal forms may not work correctly. For those, please use the sidebar element instead.', NO_HASSLE_BUILDER ) ?>
				</p>
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large">Insert Selected Widget</button>
			</div>
		</div>
	</div>
</script>
