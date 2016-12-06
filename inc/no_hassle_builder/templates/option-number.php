<script type="text/html" id="tmpl-nhb-option-number">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
	<div class="nhb-option-horizontal-layout">
		<div class="nhb-option-number-slider"></div>
		<input type="number" value="{{ data.value }}" min="{{ data.min || 0 }}" max="{{ data.max || 1000 }}" step="{{ data.step || 1 }}"/>
	</div>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
