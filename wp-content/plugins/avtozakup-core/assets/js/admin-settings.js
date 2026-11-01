( function ( $, wp ) {
	'use strict';

	$( document ).on( 'click', '.avtozakup-media-choose', function ( event ) {
		event.preventDefault();

		const field = $( this ).closest( '.avtozakup-media-field' );
		const frame = wp.media( {
			title: window.avtozakupSettingsL10n.chooseImage,
			button: { text: window.avtozakupSettingsL10n.useImage },
			library: { type: 'image' },
			multiple: false,
		} );

		frame.on( 'select', function () {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			const previewUrl = attachment.sizes && attachment.sizes.medium
				? attachment.sizes.medium.url
				: attachment.url;

			field.find( '.avtozakup-media-id' ).val( attachment.id );
			field.find( '.avtozakup-media-preview' ).attr( 'src', previewUrl ).show();
			field.find( '.avtozakup-media-remove' ).prop( 'disabled', false );
		} );

		frame.open();
	} );

	$( document ).on( 'click', '.avtozakup-media-remove', function ( event ) {
		event.preventDefault();

		const field = $( this ).closest( '.avtozakup-media-field' );
		field.find( '.avtozakup-media-id' ).val( '0' );
		field.find( '.avtozakup-media-preview' ).attr( 'src', '' ).hide();
		$( this ).prop( 'disabled', true );
	} );
}( jQuery, wp ) );

