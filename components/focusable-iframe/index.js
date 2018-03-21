/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withGlobalEvents from '../higher-order/with-global-events';

class FocusableIframe extends Component {
	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
		this.checkFocus = this.checkFocus.bind( this );
	}

	bindNode( node ) {
		this.node = node;
	}

	checkFocus() {
		const { onFocus } = this.props;
		if ( onFocus && document.activeElement === this.node ) {
			onFocus();
		}
	}

	render() {
		// Disable reason: The rendered iframe is a pass-through component,
		// assigning props inherited from the rendering parent. It's the
		// responsibility of the parent to assign a title.

		/* eslint-disable jsx-a11y/iframe-has-title */
		return (
			<iframe
				ref={ this.bindNode }
				{ ...omit( this.props, [ 'onFocus' ] ) }
			/>
		);
		/* eslint-enable jsx-a11y/iframe-has-title */
	}
}

export default withGlobalEvents( {
	blur: 'checkFocus',
} )( FocusableIframe );
