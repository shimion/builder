<script type="text/html" id="tmpl-nhb-option-button2">
	<div class="nhb-option-horizontal-layout">
		<div class="nhb-option-subtitle">{{ data.name }}</div>
		<input type="button" value="{{ data.button }}"/>
	</div>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
