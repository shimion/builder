<?php
/**
 * Text option.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-option-text">
	<div class="nhb-option-subtitle">{{ data.name }}</div>
	<input type="text" value="{{ data.value }}"/>
	<# if ( data.desc ) { #>
		<p class="nhb-description">{{{ data.desc }}}</p>
	<# }

	if ( typeof data.type_orig !== 'undefined' && typeof data.type !== 'undefined' && data.type_orig.toLowerCase() !== data.type.toLowerCase() && data.first_of_type ) { #>
		<# if ( data.type_orig === 'image' || data.type_orig === 'images' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'Heads up! You can also pick images from the media manager and get access to more controls with our %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'color' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'You can also access a nifty color picker with our %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'number' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'The %sPremium Version%s comes with a neat number slider.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'boolean' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'The %sPremium Version%s allows you to use switches to easily turn on and off settings.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'multicheck' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'Get the %sPremium Version%s to use grouped checkboxes, and get access to more controls.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'multicheck_post_type' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'You get to use post type checkboxes with the %sPremium Version%s.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'dropdown_post_type' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'Get the %sPremium Version%s to use post type dropdowns, and get access to more controls.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } else if ( data.type_orig === 'dropdown_post' ) { #>
			<p class="nhb-description-sc-map-premium">
			<?php printf( esc_html__( 'The %sPremium Version%s will allow you to use post / CPT dropdowns, and get access to more controls.', NO_HASSLE_BUILDER ), '<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=text-option&utm_campaign=Page%20Builder%20Sandwich" target="_blank">', '</a>' ) ?>
			</p>
		<# } #>
		</p>
	<# } #>
</script>
