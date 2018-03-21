/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, getWrapperDisplayName } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Listener from './listener';

/**
 * Listener instance responsible for managing document event handling.
 *
 * @type {Listener}
 */
const listener = new Listener();

const withGlobalEvents = ( eventTypesToHandlers ) => ( WrappedComponent ) => {
	class EnhancedComponent extends Component {
		constructor() {
			super( ...arguments );

			this.bindRef = this.bindRef.bind( this );
			this.handleEvent = this.handleEvent.bind( this );
		}

		componentDidMount() {
			forEach( eventTypesToHandlers, ( handler, eventType ) => {
				listener.add( eventType, this );
			} );
		}

		componentWillUnmount() {
			forEach( eventTypesToHandlers, ( handler, eventType ) => {
				listener.remove( eventType, this );
			} );
		}

		bindRef( ref ) {
			this.ref = ref;
		}

		handleEvent( event ) {
			const handler = eventTypesToHandlers[ event.type ];
			if ( typeof this.ref[ handler ] === 'function' ) {
				this.ref[ handler ]( event );
			}
		}

		render() {
			return <WrappedComponent ref={ this.bindRef	} { ...this.props } />;
		}
	}

	EnhancedComponent.displayName = getWrapperDisplayName( WrappedComponent, 'globalEvents' );

	return EnhancedComponent;
};

export default withGlobalEvents;
