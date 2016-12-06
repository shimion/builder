<script type="text/html" id="tmpl-nhb-option-checkbox">
	<# var checked = data.value === data.checked ? 'checked' : ''; #>
	<# var id = window.nhbEditor.generateHash(); #>
	<div class="nhb-option-horizontal-layout">
		<div class="nhb-option-subtitle">{{ data.name }}</div>
		<input id="nhb-checkbox-{{ id }}" type="checkbox" value="1" {{ checked }} />
		<label for="nhb-checkbox-{{ id }}"></label>
	</div>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# } #>
</script>
