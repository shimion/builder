<script type="text/html" id="tmpl-nhb-option-color">
	<# if ( typeof data.name !== 'undefined' ) { #>
		<div class="nhb-option-horizontal-layout">
	<# } #>
	<# if ( typeof data.name !== 'undefined' ) { #>
		<div class="nhb-option-subtitle">{{ data.name }}</div>
	<# } #>
	<div class="nhb-color-preview" style="background: {{ data.value }};"></div>
	<# if ( typeof data.name !== 'undefined' ) { #>
		</div>
	<# } #>
	<div class="nhb-color-popup">
		<input type="text" id="{{ data.id }}" value="{{ data.value }}"/>
	</div>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
