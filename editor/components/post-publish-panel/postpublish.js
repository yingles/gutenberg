/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * WordPress Dependencies
 */
import { PanelBody, Button, ClipboardButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

class PostPublishPanelPostpublish extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			showCopyConfirmation: false,
		};
		this.onCopy = this.onCopy.bind( this );
		this.onSelectInput = this.onSelectInput.bind( this );
	}

	componentWillUnmount() {
		clearTimeout( this.dismissCopyConfirmation );
	}

	onCopy() {
		this.setState( {
			showCopyConfirmation: true,
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false,
			} );
		}, 4000 );
	}

	onSelectInput( event ) {
		event.target.select();
	}

	render() {
		const { post, postType } = this.props;
		const viewPostLabel = get( postType, [ 'labels', 'view_item' ] );

		return (
			<div className="post-publish-panel__postpublish">
				<PanelBody className="post-publish-panel__postpublish-header">
					<a href={ post.link }>{ post.title || __( '(no title)' ) }</a>{ __( ' is now live.' ) }
				</PanelBody>
				<PanelBody>
					<div><strong>{ __( 'What\'s next?' ) }</strong></div>
					<input
						className="post-publish-panel__postpublish-link-input"
						readOnly
						value={ post.link }
						onFocus={ this.onSelectInput }
					/>
					<div className="post-publish-panel__postpublish-buttons">
						<Button className="button" href={ post.link }>
							{ viewPostLabel }
						</Button>

						<ClipboardButton className="button" text={ post.link } onCopy={ this.onCopy }>
							{ this.state.showCopyConfirmation ? __( 'Copied!' ) : __( 'Copy Link' ) }
						</ClipboardButton>
					</div>
				</PanelBody>
			</div>
		);
	}
}

export default withSelect( ( select ) => {
	const { getEditedPostAttribute, getCurrentPost } = select( 'core/editor' );
	const { getPostType } = select( 'core' );

	return {
		post: getCurrentPost(),
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
	};
} )( PostPublishPanelPostpublish );
