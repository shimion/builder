<script type="text/html" id="tmpl-nhb-option-select">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
	<select>
		<# if ( typeof data.options !== 'undefined' && typeof data.options[''] !== 'undefined' ) { #>
			<# if ( data.value === '' ) { #>
				<option value="" selected="selected">{{ data.options[''] }}</option>
			<# } else { #>
				<option value="">{{ data.options[''] }}</option>
			<# } #>
		<# } #>
		<# for ( var value in data.options ) { #>
			<# if ( value === '' ) { #>
			<# } else if ( value.match( /^\!/ ) ) { #>
				<option value="{{ value }}" disabled="disabled">{{ data.options[ value ] }}</option>
			<# } else if ( data.value === value ) { #>
				<option value="{{ value }}" selected="selected">{{ data.options[ value ] }}</option>
			<# } else { #>
				<option value="{{ value }}">{{ data.options[ value ] }}</option>
			<# } #>
		<# } #>
	</select>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
