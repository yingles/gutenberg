/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Component, Fragment, compose } from '@wordpress/element';
import { KeyboardShortcuts, withContext } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getBlockOrder, getMultiSelectedBlockUids } from '../../store/selectors';
import {
	clearSelectedBlock,
	redo,
	undo,
	autosave,
	removeBlocks,
} from '../../store/actions';

class EditorGlobalKeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );
		this.undoOrRedo = this.undoOrRedo.bind( this );
		this.save = this.save.bind( this );
		this.deleteSelectedBlocks = this.deleteSelectedBlocks.bind( this );
	}

	undoOrRedo( event ) {
		const { onRedo, onUndo } = this.props;
		if ( event.shiftKey ) {
			onRedo();
		} else {
			onUndo();
		}

		event.preventDefault();
	}

	save( event ) {
		event.preventDefault();
		this.props.onSave();
	}

	deleteSelectedBlocks( event ) {
		const { multiSelectedBlockUids, onRemove, isLocked } = this.props;
		if ( multiSelectedBlockUids.length ) {
			event.preventDefault();
			if ( ! isLocked ) {
				onRemove( multiSelectedBlockUids );
			}
		}
	}

	render() {
		return (
			<Fragment>
				<KeyboardShortcuts
					shortcuts={ {
						'mod+z': this.undoOrRedo,
						'mod+shift+z': this.undoOrRedo,
						backspace: this.deleteSelectedBlocks,
						del: this.deleteSelectedBlocks,
						escape: this.props.clearSelectedBlock,
					} }
				/>
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						'mod+s': this.save,
					} }
				/>
			</Fragment>
		);
	}
}

export default compose(
	connect(
		( state ) => {
			return {
				uids: getBlockOrder( state ),
				multiSelectedBlockUids: getMultiSelectedBlockUids( state ),
			};
		},
		{
			clearSelectedBlock,
			onRedo: redo,
			onUndo: undo,
			onRemove: removeBlocks,
			onSave: autosave,
		}
	),
	withContext( 'editor' )( ( settings ) => {
		const { templateLock } = settings;

		return {
			isLocked: !! templateLock,
		};
	} ),
)( EditorGlobalKeyboardShortcuts );
