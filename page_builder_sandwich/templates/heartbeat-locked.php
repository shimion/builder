<?php
/**
 * Template file for the post lock takeover modal. This is shown when you are
 * editing with PBS, but the post is currently locked by another user. This is
 * used to take over the editing privileges.
 *
 * @package Page Builder Sandwich
 */

?>
<script type="text/html" id="tmpl-pbs-heartbeat-locked">
	<div class="pbs-notification-dialog-background"></div>
	<div class="pbs-notification-dialog">
		<div class="post-locked-message">
			<div class="post-locked-avatar">
				<img alt="" src="{{ data.avatar }}" srcset="{{ data.avatar2x }} 2x" class="avatar avatar-64 photo" height="64" width="64">
			</div>
			<p class="currently-editing wp-tab-first" tabindex="0">
				<?php printf( esc_html( 'This content is currently locked. If you take over, %s will be blocked from continuing to edit.', PAGE_BUILDER_SANDWICH ), '{{ data.author_name }}' ); ?>
			</p>
			<p>
				<a class="button pbs-post-locked-back" href="#"><?php esc_html_e( 'Go back', PAGE_BUILDER_SANDWICH ) ?></a>
				<a class="button button-primary wp-tab-last pbs-post-locked-takeover" href="#"><?php esc_html_e( 'Take over', PAGE_BUILDER_SANDWICH ) ?></a>
			</p>
		</div>
	</div>
</script>
