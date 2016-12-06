<script type="text/html" id="tmpl-nhb-option-image">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
	<# if ( ! data.value ) { #>
		<div class="nhb-image-preview" data-id="{{ data.value }}"></div>
	<# } else {
		var imageIDs = data.value.split( ',' );
		for ( var i = 0; i < imageIDs.length; i++ ) {
			#>
			<div class="nhb-image-preview" data-id="{{ imageIDs[ i ] }}">
				<div class="nhb-image-preview-remove"></div>
			</div>
			<#
		}
	} #>
</script>
