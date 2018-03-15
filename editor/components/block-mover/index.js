/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { first } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton, withContext } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import { getBlockMoverLabel } from './mover-label';
import { getBlockIndex, getBlock } from '../../store/selectors';
import { selectBlock } from '../../store/actions';

/**
 * Module constants
 */

// <polygon points="9,5.1 2.6,11.5 4.1,12.9 9,7.9 13.9,12.9 15.4,11.5 " />
const upArrow = (
	<svg tabIndex="-1" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" aria-hidden role="img" focusable="false">
		<polygon points="9,4.5 3.3,10.1 4.8,11.5 9,7.3 13.2,11.5 14.7,10.1 " />
	</svg>
);

const downArrow = (
	<svg tabIndex="-1" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" aria-hidden role="img" focusable="false">
		<polygon points="9,13.5 14.7,7.9 13.2,6.5 9,10.7 4.8,6.5 3.3,7.9 " />
	</svg>
);

export function BlockMover( { onMoveUp, onMoveDown, isFirst, isLast, uids, blockType, firstIndex, isLocked } ) {
	if ( isLocked ) {
		return null;
	}

	// We emulate a disabled state because forcefully applying the `disabled`
	// attribute on the button while it has focus causes the screen to change
	// to an unfocused state (body as active element) without firing blur on,
	// the rendering parent, leaving it unable to react to focus out.
	return (
		<div className="editor-block-mover">
			<IconButton
				className="editor-block-mover__control"
				onClick={ isFirst ? null : onMoveUp }
				icon={ upArrow }
				tooltip={ __( 'Move Up' ) }
				label={ getBlockMoverLabel(
					uids.length,
					blockType && blockType.title,
					firstIndex,
					isFirst,
					isLast,
					-1,
				) }
				aria-disabled={ isFirst }
			/>
			<IconButton
				className="editor-block-mover__control"
				onClick={ isLast ? null : onMoveDown }
				icon={ downArrow }
				tooltip={ __( 'Move Down' ) }
				label={ getBlockMoverLabel(
					uids.length,
					blockType && blockType.title,
					firstIndex,
					isFirst,
					isLast,
					1,
				) }
				aria-disabled={ isLast }
			/>
		</div>
	);
}

/**
 * Action creator creator which, given the action type to dispatch and the
 * arguments of mapDispatchToProps, creates a prop dispatcher callback for
 * managing block movement.
 *
 * @param {string}   type     Action type to dispatch.
 * @param {Function} dispatch Store dispatch.
 * @param {Object}   ownProps The wrapped component's own props.
 *
 * @return {Function} Prop dispatcher callback.
 */
function createOnMove( type, dispatch, ownProps ) {
	return () => {
		const { uids, rootUID } = ownProps;
		if ( uids.length === 1 ) {
			dispatch( selectBlock( first( uids ) ) );
		}

		dispatch( { type, uids, rootUID } );
	};
}

export default compose(
	connect(
		( state, ownProps ) => {
			const { uids, rootUID } = ownProps;
			const block = getBlock( state, first( uids ) );

			return ( {
				firstIndex: getBlockIndex( state, first( uids ), rootUID ),
				blockType: block ? getBlockType( block.name ) : null,
			} );
		},
		( ...args ) => ( {
			onMoveDown: createOnMove( 'MOVE_BLOCKS_DOWN', ...args ),
			onMoveUp: createOnMove( 'MOVE_BLOCKS_UP', ...args ),
		} )
	),
	withContext( 'editor' )( ( settings ) => {
		const { templateLock } = settings;

		return {
			isLocked: templateLock === 'all',
		};
	} ),
)( BlockMover );
