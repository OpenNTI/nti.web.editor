import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAgent from 'fbjs/lib/UserAgent';
import Editor from 'draft-js-plugins-editor';
import {EditorState, RichUtils} from 'draft-js';
import {buffer} from 'nti-commons';

import ContextProvider from '../ContextProvider';

const CONTENT_CHANGE_BUFFER = 1000;

const INTERNAL_CHANGE = Symbol('Internal Change');

//TODO: move the allowed(InlineStyle, BlockTypes, Links) to plugins instead of props

export default class DraftCoreEditor extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		id: PropTypes.string,

		editorState: PropTypes.object.isRequired,
		plugins: PropTypes.array,
		placeholder: PropTypes.string,
		readOnly: PropTypes.bool,

		contentChangeBuffer: PropTypes.number,

		onChange: PropTypes.func,
		onContentChange: PropTypes.func,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		handleKeyCommand: PropTypes.func

	}

	static defaultProps = {
		editorState: EditorState.createEmpty(),
		plugins: [],

		allowKeyBoardShortcuts: true,

		contentChangeBuffer: CONTENT_CHANGE_BUFFER
	}


	attachContextRef = (r) => this.editorContext = r
	attachEditorRef = (r) => this.draftEditor = r
	attachContainerRef = (r) => this.editorContainer = r

	constructor (props) {
		super(props);

		const {contentChangeBuffer, editorState, plugins} = props;

		this.onContentChangeBuffered = buffer(contentChangeBuffer, this.onContentChange);

		this.state = {
			currentEditorState: editorState,
			currentPlugins: plugins
		};
	}


	get container () {
		return this.editorContainer;
	}


	get editorState () {
		return this.state.currentEditorState;
	}


	getPluginContext = () => {
		const {plugins} = this.props;
		let context = {};

		for (let plugin of plugins) {
			if (plugin.getContext) {
				let pluginContext = plugin.getContext(() => this.getEditorState(), (state, cb) => this.setEditorState(state, cb), () => this.focus());
				context = {...context, ...pluginContext};
			}
		}

		return context;
	}


	getEditorState = () => {
		return this.editorState;
	}


	setEditorState = (state, cb) => {
		this[INTERNAL_CHANGE](state, cb);
	}

	[INTERNAL_CHANGE] (editorState, cb) {
		const {plugins} = this.props;
		const pluginMethods = this.draftEditor && this.draftEditor.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.onChange) {
				plugin.onChange(editorState, pluginMethods);
			}
		}

		this.onChange(editorState, cb);
	}

	componentDidMount () {
		const {plugins, id} = this.props;

		for (let plugin of plugins) {
			if (plugin.setEditor) {
				plugin.setEditor(this);
			}
		}

		if (id) {
			ContextProvider.register(id, this);
		}
	}


	componentWillUnmount () {
		const {plugins, id} = this.props;

		for (let plugin of plugins) {
			if (plugin.setEditor) {
				plugin.setEditor(null);
			}
		}

		if (id) {
			ContextProvider.unregister(id, this);
		}
	}


	componentWillReceiveProps (nextProps) {
		const {plugins:newPlugins, editorState:newEditorState, contentChangeBuffer:newContentChangeBuffer} = nextProps;
		const {plugins:oldPlugins, editorState:oldEditorState, contentChangeBuffer:oldContentChangeBuffer} = this.props;
		let newState = null;

		if (newContentChangeBuffer !== oldContentChangeBuffer) {
			this.onContentChangeBuffered = buffer(newContentChangeBuffer, this.onContentChange);
		}

		if (newEditorState !== oldEditorState) {
			newState = newState || {};
			newState.currentEditorState = this.getNewState(newEditorState);
		}

		if (newPlugins !== oldPlugins) {
			newState = newState || {};
			newState.currentPlugins = newPlugins;
		}

		if (newState) {
			this.setState(newState);
		}
	}


	getNewState (state) {
		const {editorState} = this;

		return EditorState.push(editorState, state.getCurrentContent(), 'insert-fragment');
	}


	focus = () => {
		// const {editorState} = this;

		if (this.draftEditor) {
			this.draftEditor.focus();
		}
	}


	onContentChange = () => {
		const {onContentChange} = this.props;
		const {currentEditorState} = this.state;

		if (onContentChange) {
			onContentChange(currentEditorState);
		}
	}


	onChange = (editorState, cb) => {
		const {onChange} = this.props;
		const {currentEditorState} = this.state;
		const contentChanged = currentEditorState.getCurrentContent() !== editorState.getCurrentContent()
			|| editorState.getLastChangeType() === 'apply-entity';
		this.hasPendingChanges = this.hasPendingChanges || contentChanged;

		this.setState({currentEditorState: editorState}, () => {
			if (typeof cb === 'function') {
				cb();
			}

			if (onChange) {
				onChange(editorState);
			}

			if (this.hasPendingChanges) {
				this.onContentChangeBuffered();
				this.hasPendingChanges = false;
			}
		});
	}


	onFocus = () => {
		const {onFocus} = this.props;

		if (onFocus) {
			onFocus(this);
		}
	}


	onBlur = () => {
		const {onBlur} = this.props;

		if (onBlur) {
			onBlur(this);
		}
	}


	handleKeyCommand = (command) => {
		const {handleKeyCommand} = this.props;

		//If the prop handles the key command let it
		if (handleKeyCommand && handleKeyCommand(command)) {
			return true;
		}

		//Otherwise do the default
		const {editorState} = this;
		const newState = RichUtils.handleKeyCommand(editorState, command);

		if (newState) {
			this.onChange(newState);
			return true;
		}

		return false;
	}


	render () {
		const {className, placeholder, readOnly} = this.props;
		const {currentEditorState:editorState, currentPlugins:plugins, busy} = this.state;

		const contentState = editorState && editorState.getCurrentContent();
		const hidePlaceholder = contentState && !contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled';
		const pluginClasses = plugins.map(x => x.editorClass);
		const pluginOverlays = plugins.map(x => x.overlayComponent).filter(x => x);

		const cls = cx(
			'nti-draft-core',
			className,
			pluginClasses,
			{
				busy,
				'auto-hyphenate': UserAgent.isBrowser('Firefox'),// || UserAgent.isBrowser('IE')
				'hide-placeholder': hidePlaceholder,
				'read-only': readOnly
			}
		);

		return (
			<div ref={this.attachContainerRef} className="nti-draft-core-container">
				<ContextProvider editor={this} ref={this.attachContextRef} internal>
					<div className={cls} onClick={this.focus}>
						<Editor
							ref={this.attachEditorRef}
							editorState={editorState}
							plugins={plugins}
							onChange={this.onChange}
							onFocus={this.onFocus}
							onBlur={this.onBlur}
							handleKeyCommand={this.handleKeyCommand}
							placeholder={placeholder}
							readOnly={readOnly}
						/>
					</div>
				</ContextProvider>
				{pluginOverlays.length ?
					pluginOverlays.map((x, index) => React.createElement(x, {key: index, getEditorState: this.getEditorState, setEditorState: this.setEditorState, editor: this})) :
					null
				}
			</div>
		);
	}
}
