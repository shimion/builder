<?php
/**
 * Template file for the widget picker modal popup.
 *
 * @package Page Builder Sandwich
 */

?>
<script type="text/html" id="tmpl-pbs-widget-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', PAGE_BUILDER_SANDWICH ), __( 'Widget', PAGE_BUILDER_SANDWICH ) ) ) ?>" id="pbs-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content pbs-search-list-frame">

		<div class="pbs-search-list">
			<div class="pbs-no-results"><?php esc_html_e( 'No matches found', PAGE_BUILDER_SANDWICH ) ?></div>
			<?php
			$widgets = PBSElementWidget::gather_all_widgets();
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
					<?php esc_html_e( 'Some widgets that use specialized scripts and modal forms may not work correctly. For those, please use the sidebar element instead.', PAGE_BUILDER_SANDWICH ) ?>
				</p>
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large">Insert Selected Widget</button>
			</div>
		</div>
	</div>
</script>
