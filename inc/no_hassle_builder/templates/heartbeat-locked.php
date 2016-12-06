<?php
/**
 * Template file for the post lock takeover modal. This is shown when you are
 * editing with nhb, but the post is currently locked by another user. This is
 * used to take over the editing privileges.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-heartbeat-locked">
	<div class="nhb-notification-dialog-background"></div>
	<div class="nhb-notification-dialog">
		<div class="post-locked-message">
			<div class="post-locked-avatar">
				<img alt="" src="{{ data.avatar }}" srcset="{{ data.avatar2x }} 2x" class="avatar avatar-64 photo" height="64" width="64">
			</div>
			<p class="currently-editing wp-tab-first" tabindex="0">
				<?php printf( esc_html( 'This content is currently locked. If you take over, %s will be blocked from continuing to edit.', NO_HASSLE_BUILDER ), '{{ data.author_name }}' ); ?>
			</p>
			<p>
				<a class="button nhb-post-locked-back" href="#"><?php esc_html_e( 'Go back', NO_HASSLE_BUILDER ) ?></a>
				<a class="button button-primary wp-tab-last nhb-post-locked-takeover" href="#"><?php esc_html_e( 'Take over', NO_HASSLE_BUILDER ) ?></a>
			</p>
		</div>
	</div>
</script>
