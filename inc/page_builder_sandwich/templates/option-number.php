<script type="text/html" id="tmpl-pbs-option-number">
	<div class="pbs-option-subtitle">{{ data.name }}</div>
	<div class="pbs-option-horizontal-layout">
		<div class="pbs-option-number-slider"></div>
		<input type="number" value="{{ data.value }}" min="{{ data.min || 0 }}" max="{{ data.max || 1000 }}" step="{{ data.step || 1 }}"/>
	</div>
	<# if ( data.desc ) { #>
		<p class="pbs-description">{{{ data.desc }}}</p>
	<# } #>
</script>
