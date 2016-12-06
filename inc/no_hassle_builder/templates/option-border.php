<script type="text/html" id="tmpl-nhb-option-border">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
		<div class="nhb-color-preview" style="background: {{ data['border-color'] }};"></div>
		<select>
			<#
			var borders = {
				'none': '<?php _e( 'None', NO_HASSLE_BUILDER ) ?>',
				'solid': '<?php _e( 'Solid', NO_HASSLE_BUILDER ) ?>',
				'dashed': '<?php _e( 'Dashed', NO_HASSLE_BUILDER ) ?>',
				'dotted': '<?php _e( 'Dotted', NO_HASSLE_BUILDER ) ?>',
				'double': '<?php _e( 'Double', NO_HASSLE_BUILDER ) ?>',
				'groove': '<?php _e( 'Groove', NO_HASSLE_BUILDER ) ?>',
				'ridge': '<?php _e( 'Ridge', NO_HASSLE_BUILDER ) ?>',
				'inset': '<?php _e( 'Inset', NO_HASSLE_BUILDER ) ?>',
				'outset': '<?php _e( 'Outset', NO_HASSLE_BUILDER ) ?>'
			};
			#>
			<# for ( var key in borders ) { #>
				<# if ( data['border-style'] === key ) { #>
					<option value="{{ key }}" selected="selected">{{ borders[ key ] }}</option>
				<# } else { #>
					<option value="{{ key }}">{{ borders[ key ] }}</option>
				<# } #>
			<# } #>
		</select>
		<label>Radius</label><input type="text" class="radius" value="{{ data['border-radius'] }}"/>
		<div class="nhb-color-popup">
			<input type="text" id="{{ data.id }}" value="{{ data['border-color'] }}"/>
		</div>
</script>
