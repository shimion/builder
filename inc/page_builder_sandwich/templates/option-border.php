<script type="text/html" id="tmpl-pbs-option-border">
	<div class="pbs-option-subtitle">{{ data.name }}</div>
		<div class="pbs-color-preview" style="background: {{ data['border-color'] }};"></div>
		<select>
			<#
			var borders = {
				'none': '<?php _e( 'None', PAGE_BUILDER_SANDWICH ) ?>',
				'solid': '<?php _e( 'Solid', PAGE_BUILDER_SANDWICH ) ?>',
				'dashed': '<?php _e( 'Dashed', PAGE_BUILDER_SANDWICH ) ?>',
				'dotted': '<?php _e( 'Dotted', PAGE_BUILDER_SANDWICH ) ?>',
				'double': '<?php _e( 'Double', PAGE_BUILDER_SANDWICH ) ?>',
				'groove': '<?php _e( 'Groove', PAGE_BUILDER_SANDWICH ) ?>',
				'ridge': '<?php _e( 'Ridge', PAGE_BUILDER_SANDWICH ) ?>',
				'inset': '<?php _e( 'Inset', PAGE_BUILDER_SANDWICH ) ?>',
				'outset': '<?php _e( 'Outset', PAGE_BUILDER_SANDWICH ) ?>'
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
		<div class="pbs-color-popup">
			<input type="text" id="{{ data.id }}" value="{{ data['border-color'] }}"/>
		</div>
</script>
