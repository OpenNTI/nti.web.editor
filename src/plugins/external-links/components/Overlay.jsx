import PropTypes from 'prop-types';
import React from 'react';
import {Flyout} from 'nti-web-commons';

import {getEventFor} from '../../Store';
import {getCmpForState} from '../utils';
import {SelectedEntityKey, EditingEntityKey} from '../Constants';

import Editor from './Editor';

const selectedEntityKeyEvent = getEventFor(SelectedEntityKey);
const editingEntityKeyEvent = getEventFor(EditingEntityKey);

export default class ExternalLinkOverlay extends React.Component {
	static propTypes = {
		store: PropTypes.shape({
			addListener: PropTypes.func,
			removeListener: PropTypes.func
		}),
		getEditorState: PropTypes.func,
		setEditorState: PropTypes.func,
		editor: PropTypes.any
	}


	state = {selectedEntity: null, position: null}

	events = {
		[selectedEntityKeyEvent]: (x) => this.onSelectedEntityKeyChanged(x),
		[editingEntityKeyEvent]: (x) => this.onEditingEntityKeyChanged(x)
	}


	get editorState () {
		const {getEditorState} = this.props;

		return getEditorState && getEditorState();
	}


	componentDidMount () {
		const {store} = this.props;

		if (store) {
			store.addListeners(this.events);
		}
	}


	componentWillUnmount () {
		const {store} = this.props;

		if (store) {
			store.removeListeners(this.events);
		}
	}


	onSelectedEntityKeyChanged = (entityKey) => {
		const {store} = this.props;
		const key = store.getItem(EditingEntityKey) || entityKey;
		const entityCmp = key && getCmpForState(store.getItem(key) || [], this.editorState);

		this.setState({
			entityCmp,
			entityKey: key
		});
	}


	onEditingEntityKeyChanged = (entityKey) => {
		const {store} = this.props;
		const key = entityKey || store.getItem(SelectedEntityKey);
		const entityCmp = key && getCmpForState(store.getItem(key) || [], this.editorState);

		this.setState({
			entityCmp,
			entityKey: key
		});
	}


	onEditorClose = () => {
		const {editor} = this.props;

		if (editor) {
			editor.focus();
		}
	}


	onEntitySave = () => {
		const {editor} = this.props;

		if (editor) {
			editor.onContentChange();
		}
	}


	render () {
		const {store, getEditorState, setEditorState, editor} = this.props;
		const {entityCmp, entityKey, selection} = this.state;

		if (!entityCmp || !editor) {
			return null;
		}

		return (
			<Flyout.Aligned
				className="external-link-overlay"
				alignTo={entityCmp}
				parent={editor && editor.container}

				visible={entityCmp && editor ? true : false}
				arrow
				alignToArrow
				constrain

				horizontalAlign={Flyout.ALIGNMENTS.LEFT_OR_RIGHT}
			>
				<Editor
					entityKey={entityKey}
					offsetKey={entityCmp.offsetKey}
					decoratedText={entityCmp.decoratedText}
					store={store} selection={selection}
					getEditorState={getEditorState}
					setEditorState={setEditorState}
					onClose={this.onEditorClose}
					onEntitySave={this.onEntitySave}
				/>
			</Flyout.Aligned>
		);
	}
}
