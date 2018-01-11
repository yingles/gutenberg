/**
 * External Dependencies
 */
import { compact, get, noop, startsWith } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 *	Media Upload is used by audio, image, gallery and video blocks to handle uploading a media file
 *	when a file upload button is activated.
 *
 *	TODO: future enhancement to add an upload indicator.
 *
 * @param   {Object}   $0                   Parameters object passed to the function.
 * @param   {string}   $0.allowedType       The type of media that can be uploaded.
 * @param   {Array}    $0.filesList         List of files.
 * @param   {number}   $0.maxUploadFileSize Maximum upload size in bytes allowed for the site.
 * @param   {Function} $0.onError           Function called when an error happens.
 * @param   {Function} $0.onFileChange      Function called each time a file or a temporary representation of the file is available.
 */
export function mediaUpload( {
	allowedType,
	filesList,
	maxUploadFileSize = get( window, '_wpMediaSettings.maxUploadSize', 0 ),
	onError = noop,
	onFileChange,
} ) {
	// Cast filesList to array
	const files = [ ...filesList ];

	const filesSet = [];
	const setAndUpdateFiles = ( idx, value ) => {
		filesSet[ idx ] = value;
		onFileChange( compact( filesSet ) );
	};
	const isAllowedType = ( fileType ) => startsWith( fileType, `${ allowedType }/` );
	files.forEach( ( mediaFile, idx ) => {
		if ( ! isAllowedType( mediaFile.type ) ) {
			return;
		}

		// verify if file is greater than the maximum file upload size allowed for the site.
		if ( maxUploadFileSize && mediaFile.size > maxUploadFileSize ) {
			onError(
				sprintf(
					__( '%s exceeds the maximum upload size for this site.' ),
					mediaFile.name
				)
			);
			return;
		}

		// Set temporary URL to create placeholder media file, this is replaced
		// with final file from media gallery when upload is `done` below
		filesSet.push( { url: window.URL.createObjectURL( mediaFile ) } );
		onFileChange( filesSet );

		return createMediaFromFile( mediaFile ).then(
			( savedMedia ) => {
				const mediaObject = {
					id: savedMedia.id,
					url: savedMedia.source_url,
					link: savedMedia.link,
				};
				const caption = get( savedMedia, [ 'caption', 'raw' ] );
				if ( caption ) {
					mediaObject.caption = [ caption ];
				}
				setAndUpdateFiles( idx, mediaObject );
			},
			() => {
				// Reset to empty on failure.
				setAndUpdateFiles( idx, null );
				onError(
					sprintf(
						__( 'Error while uploading file %s to the media library.' ),
						mediaFile.name
					)
				);
			}
		);
	} );
}

/**
 * @param {File} file Media File to Save.
 *
 * @return {Promise} Media Object Promise.
 */
function createMediaFromFile( file ) {
	// Create upload payload
	const data = new window.FormData();
	data.append( 'file', file, file.name || file.type.replace( '/', '.' ) );
	return wp.apiRequest( {
		path: '/wp/v2/media',
		data,
		contentType: false,
		processData: false,
		method: 'POST',
	} );
}

/**
 * Utility used to preload an image before displaying it.
 *
 * @param   {string}  url Image Url.
 * @return {Promise}     Pormise resolved once the image is preloaded.
 */
export function preloadImage( url ) {
	return new Promise( resolve => {
		const newImg = new window.Image();
		newImg.onload = function() {
			resolve( url );
		};
		newImg.src = url;
	} );
}
