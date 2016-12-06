<script type="text/html" id="tmpl-pbs-option-button2">
	<div class="pbs-option-horizontal-layout">
		<div class="pbs-option-subtitle">{{ data.name }}</div>
		<input type="button" value="{{ data.button }}"/>
	</div>
	<# if ( data.desc ) { #>
		<p class="pbs-description">{{{ data.desc }}}</p>
	<# } #>
</script>
