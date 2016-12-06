<script type="text/html" id="tmpl-nhb-option-textarea">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
	<textarea>{{ data.value }}</textarea>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
