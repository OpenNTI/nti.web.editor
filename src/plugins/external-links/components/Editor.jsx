import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import {Entity} from 'draft-js';
import {scoped} from 'nti-lib-locale';
import {Button, Input} from 'nti-web-commons';

import {EditingEntityKey, SelectedEntityKey} from '../Constants';
import {getEventFor} from '../../Store';
import {
	removeEntityKeyAtOffset,
	replaceEntityTextAtOffset,
	createNewLinkAtOffset,
	isEntityAtOffsetInSingleBlock
} from '../utils';


const DEFAULT_TEXT = {
	urlLabel: 'URL',
	displayLabel: 'Display Text',
	save: 'Save',
	cancel: 'Cancel',
	edit: 'Change',
	remove: 'Remove',
	invalid: 'Please enter a valid url.'
};

const t = scoped('EXTERNAL_LINK_EDITOR', DEFAULT_TEXT);

const stop = e => e.preventDefault();

const editingEntityKeyEvent = getEventFor(EditingEntityKey);

export default class ExternalLinkEditor extends React.Component {
	static propTypes = {
		entityKey: PropTypes.string,
		offsetKey: PropTypes.string,
		decoratedText: PropTypes.string,
		store: PropTypes.shape({
			setItem: PropTypes.func,
			addListener: PropTypes.func,
			removeListener: PropTypes.func
		}),
		getEditorState: PropTypes.func,
		setEditorState: PropTypes.func,
		onClose: PropTypes.func,
		onEntitySave: PropTypes.func
	}


	attachURLInputRef = x => this.urlInput = x
	state = {}

	constructor (props) {
		super(props);

		this.state = this.getStateFor(props);
	}

	getStateFor (props = this.props) {
		const {entityKey, decoratedText, offsetKey, getEditorState} = props;
		const entity = Entity.get(entityKey);
		const {data} = entity;

		return {
			entity,
			decoratedText,
			newLink: !data.href,
			editing: !data.href,
			href: data.href || '',
			isSingleBlock: isEntityAtOffsetInSingleBlock(entityKey, offsetKey, getEditorState())
		};
	}


	componentWillReceiveProps (nextProps) {
		const {entityKey:oldKey, decoratedText:oldText} = this.props;
		const {entityKey:newKey, decoratedText:newText} = nextProps;

		if (oldKey !== newKey || oldText !== newText) {
			this.setState(this.getStateFor(nextProps));
		}
	}


	componentDidMount () {
		const {store} = this.props;
		const {editing} = this.state;

		if (store) {
			store.removeListener(editingEntityKeyEvent, this.onEditingEntityKeyChange);
			store.addListener(editingEntityKeyEvent, this.onEditingEntityKeyChange);
		}

		if (editing) {
			this.setEditing();
		}
	}


	componentWillUnmount () {
		const {store} = this.props;

		//There's apparently a race condition where the event fires before we remove
		//the listener, but the component is unmounted so the set state in the handler
		//is generating a warning.
		this.didUnmount = true;

		if (store) {
			store.removeListener(editingEntityKeyEvent, this.onEditingEntityKeyChange);
		}
	}


	onEditingEntityKeyChange = (key) => {
		if (this.didUnmount) {
			return;
		}

		const {entityKey} = this.props;
		const editing = entityKey === key;

		this.setState({
			editing
		}, () => {
			if (this.urlInput) {
				this.urlInput.focus();
			}
		});
	}


	setEditing () {
		const {store, entityKey} = this.props;

		store.setItem(EditingEntityKey, entityKey);
	}


	setNotEditing () {
		const {store, onClose} = this.props;
		const {newLink} = this.state;

		store.setItem(EditingEntityKey, null);
		store.setItem(SelectedEntityKey, null);

		if (newLink && !this.hasSaved) {
			this.doRemove();
		}


		if (onClose) {
			onClose();
		}
	}


	onInputFocus = () => {
		this.setEditing();

		this.isFocused = true;
	}


	onInputBlur = () => {
		this.isFocused = false;

		//Wait to see if we can focus
		setTimeout(() => {
			if (!this.isFocused) {
				this.setNotEditing();
			}
		});
	}


	doRemove () {
		const {getEditorState, setEditorState, entityKey, offsetKey} = this.props;
		const newState = removeEntityKeyAtOffset(entityKey, offsetKey, getEditorState());

		setEditorState(newState);
	}


	doSave () {
		const {entityKey, decoratedText:oldText, onEntitySave} = this.props;
		const {fullHref, href, decoratedText:newText, newLink,} = this.state;
		const newHref = fullHref || href;

		if (newLink) {
			this.createNewLink(newHref, oldText === newText ? null : newText || newHref);
		} else {
			Entity.mergeData(entityKey, {href: newHref});

			if (newText !== oldText) {
				this.replaceText(newText || newHref);
			} else {
				//If the text didn't change it might not trigger a content change
				//so call this call back to trigger one so we save.
				if (onEntitySave) {
					onEntitySave();
				}

				this.setNotEditing();
			}
		}

		this.hasSaved = true;
	}

	createNewLink (link, newText) {
		const {getEditorState, setEditorState, entityKey, offsetKey} = this.props;
		const newState = createNewLinkAtOffset(link, newText, entityKey, offsetKey, getEditorState());

		setEditorState(newState, () => this.setNotEditing());
	}


	replaceText (text) {
		const {getEditorState, setEditorState, entityKey, offsetKey} = this.props;
		const newState = replaceEntityTextAtOffset(text, entityKey, offsetKey, getEditorState());

		setEditorState(newState, () => this.setNotEditing());
	}


	onURLChange = (href, fullHref) => {
		this.setState({
			href,
			fullHref,
			error: null
		});
	}


	onDecoratedTextChange = (decoratedText) => {
		this.setState({
			decoratedText
		});
	}


	onSave = () => {
		//Set this to true so we keep focus until we are done saving
		this.isFocused = true;

		if (this.urlInput && !this.urlInput.validity.valid) {
			this.setState({
				error: t('invalid')
			});
		} else {
			this.doSave();
		}
	}


	onCancel = () => {
		this.setNotEditing();
	}


	onEdit = () => {
		this.setEditing();
	}


	onRemove = () => {
		//Set this to true so we can keep focus until we are done saving
		this.isFocused = true;

		this.doRemove();

		this.setNotEditing();
	}


	render () {
		const {editing} = this.state;

		return (
			<div className="external-link-editor-container">
				{
					editing ?
						this.renderEditor() :
						this.renderInfo()
				}
			</div>
		);
	}


	renderEditor = () => {
		const {href, decoratedText, error, isSingleBlock} = this.state;
		const cls = cx('external-link-editor', {error});

		return (
			<div className={cls}>
				{error && (<div className="error">{error}</div>)}
				<Input.Label className="url-input" label={t('urlLabel')}>
					<Input.Clearable>
						<Input.URL  value={href} onChange={this.onURLChange} onFocus={this.onInputFocus} onBlur={this.onInputBlur} ref={this.attachURLInputRef} />
					</Input.Clearable>
				</Input.Label>
				{isSingleBlock && (
					<Input.Label className="display-input" label={t('displayLabel')}>
						<Input.Clearable>
							<Input.Text value={decoratedText} onFocus={this.onInputFocus} onBlur={this.onInputBlur} onChange={this.onDecoratedTextChange} />
						</Input.Clearable>
					</Input.Label>
				)}
				<div className="buttons" onMouseDown={stop}>
					<Button className="cancel" onClick={this.onCancel} rounded secondary>{t('cancel')}</Button>
					<Button className="save" onClick={this.onSave} rounded disabled={!href}>{t('save')}</Button>
				</div>
			</div>
		);
	}


	renderInfo = () => {
		const {href} = this.state;

		return (
			<div className="external-link-info" onMouseDown={stop}>
				<span className="link">{href}</span>
				<span className="edit" onClick={this.onEdit}>{t('edit')}</span>
				<span className="remove" onClick={this.onRemove}>{t('remove')}</span>
			</div>
		);
	}
}
