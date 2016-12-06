<script type="text/html" id="tmpl-pbs-option-textarea">
	<div class="pbs-option-subtitle">{{ data.name }}</div>
	<textarea>{{ data.value }}</textarea>
	<# if ( data.desc ) { #>
		<p class="pbs-description">{{{ data.desc }}}</p>
	<# } #>
</script>
