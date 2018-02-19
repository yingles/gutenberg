/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getAutosaveMessage } from '../../../store/selectors';

function AutosaveMessage( { children } ) {
	if ( ! children ) {
		return null;
	}
	return (
		<PanelRow>
			{ __( 'Autosave' ) }
			<div>{ children }</div>
		</PanelRow>
	);
}

export default connect(
	( state ) => {
		return {
			children: getAutosaveMessage( state ),
		};
	}
)( AutosaveMessage );
