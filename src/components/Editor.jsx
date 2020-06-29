import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAgent from 'fbjs/lib/UserAgent';
import {EditorState, RichUtils} from 'draft-js';
import {buffer} from '@nti/lib-commons';

import ContextProvider from '../ContextProvider';

import { decomposePlugins } from './utils';
import Editor from './BaseEditor';

const CONTENT_CHANGE_BUFFER = 1000;

const INTERNAL_CHANGE = Symbol('Internal Change');
const TRANSFORM_OUTPUT = Symbol('Transform Output');
const TRANSFORM_INPUT = Symbol('Transform Input');

//TODO: move the allowed(InlineStyle, BlockTypes, Links) to plugins instead of props
export default class DraftCoreEditor extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		id: PropTypes.string,

		editorState: PropTypes.object.isRequired,
		plugins: PropTypes.array,
		customKeyBindings: PropTypes.object,
		placeholder: PropTypes.string,
		readOnly: PropTypes.bool,
		autoFocus: PropTypes.bool,

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


	static contextTypes = {
		draftCoreEditor: PropTypes.shape({
			parentEditor: PropTypes.shape({
				deactivate: PropTypes.func,
				activate: PropTypes.func
			})
		})
	}


	static childContextTypes = {
		draftCoreEditor: PropTypes.shape({
			parentEditor: PropTypes.shape({
				deactivate: PropTypes.func,
				activate: PropTypes.func
			})
		})
	}


	attachContextRef = (r) => this.editorContext = r
	attachEditorRef = (r) => this.draftEditor = r
	attachContainerRef = (r) => {
		this.editorContainer = r;

		if (r) {
			this.setupContainerListeners(r);
		} else {
			this.removeContainerListeners();
		}
	}

	constructor (props) {
		super(props);

		const {contentChangeBuffer, editorState, plugins} = props;

		this.onContentChangeBuffered = buffer(contentChangeBuffer, this.onContentChange);

		const currentPlugins = decomposePlugins(plugins);

		this.state = {
			currentEditorState: this[TRANSFORM_INPUT](editorState),
			currentEditorStateId: Date.now(),
			currentPlugins,
			active: true
		};
	}


	get container () {
		return this.editorContainer;
	}


	get editorState () {
		return this.state.currentEditorState;
	}

	get editorStateId () {
		return this.state.currentEditorStateId;
	}

	get readOnly () {
		return this.draftEditor && this.draftEditor.state && this.draftEditor.state.readOnly;
	}


	get parentEditor () {
		const {draftCoreEditor} = this.context;
		const {parentEditor} = draftCoreEditor || {};

		return parentEditor;
	}


	getChildContext () {
		const {parentEditor} = this;

		return {
			draftCoreEditor: {
				parentEditor: {
					activate: () => {
						const {active:wasActive} = this.state;

						if (!wasActive) {
							this.setState({active: true});
						}

						if (parentEditor) {
							parentEditor.activate();
						}
					},
					deactivate: () => {
						const {active:wasActive} = this.state;

						if (wasActive) {
							this.setState({active: false});
						}

						if (parentEditor) {
							parentEditor.deactivate();
						}
					}
				}
			}
		};
	}


	getPluginContext = () => {
		const {plugins} = this.props;
		let context = {};

		for (let plugin of plugins) {
			if (plugin.getContext) {
				let pluginContext = plugin.getContext(() => this.getEditorState(), (state, cb) => this.setEditorState(state, cb), () => this.focus(), plugins);
				context = {...context, ...pluginContext};
			}
		}

		return context;
	}


	//This is used internally by plugins so it needs to not transform the state
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
				editorState = plugin.onChange(editorState, pluginMethods);
			}
		}

		this.onChange(editorState, cb);
	}

	[TRANSFORM_OUTPUT] (editorState) {
		const {plugins} = this.props;
		const pluginMethods = this.draftEditor && this.draftEditor.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.transformOutput) {
				editorState = plugin.transformOutput(editorState, pluginMethods);
			}
		}

		return editorState;
	}

	[TRANSFORM_INPUT] (editorState) {
		const {plugins} = this.props;
		const pluginMethods = this.draftEditor && this.draftEditor.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.transformInput) {
				editorState = plugin.transformInput(editorState, pluginMethods);
			}
		}

		return editorState;
	}

	componentDidMount () {
		const {plugins, id, autoFocus} = this.props;

		for (let plugin of plugins) {
			if (plugin.setEditor) {
				plugin.setEditor(this);
			}
		}

		if (id) {
			ContextProvider.register(id, this);
		}

		if (autoFocus) {
			setTimeout(() => this.focus(), 100);
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


	componentDidUpdate (prevProps) {
		const {plugins:newPlugins, editorState:newEditorState, contentChangeBuffer:newContentChangeBuffer} = this.props;
		const {plugins:oldPlugins, editorState:oldEditorState, contentChangeBuffer:oldContentChangeBuffer} = prevProps;

		let newState = null;

		if (newContentChangeBuffer !== oldContentChangeBuffer) {
			this.onContentChangeBuffered = buffer(newContentChangeBuffer, this.onContentChange);
		}

		if (newEditorState !== oldEditorState) {
			newState = newState || {};
			newState.currentEditorState = this.getNewState(this[TRANSFORM_INPUT](newEditorState));
			newState.currentEditorStateId = Date.now();
		}

		if (newPlugins !== oldPlugins) {
			newState = newState || {};
			newState.currentPlugins = decomposePlugins(newPlugins);
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


	setupContainerListeners (container) {
		if (!this.parentEditor) { return; }

		this.removeContainerListeners();

		container.addEventListener('focusin', this.onContainerFocus, true);
		container.addEventListener('focusout', this.onContainerBlur, true);

		this.unsubscribeFromContainer = () => {
			container.removeEventListener('focusin', this.onContainerFocus, true);
			container.removeEventListener('focusout', this.onContainerBlur, true);
		};
	}


	removeContainerListeners () {
		if (this.unsubscribeFromContainer) {
			this.unsubscribeFromContainer();
			this.unsubscribeFromContainer = () => {};
		}
	}


	onContainerFocus = (e) => {
		e.stopPropagation();
		const {parentEditor} = this;

		if (parentEditor) {
			parentEditor.deactivate();
		}
	}


	onContainerBlur = (e) => {
		e.stopPropagation();
		const {parentEditor} = this;

		if (parentEditor) {
			parentEditor.activate();
		}
	}



	onSetReadOnly = () => {
		if (this.editorContext) {
			this.editorContext.updateExternalLinks();
		}
	}


	onContentChange = () => {
		const {onContentChange} = this.props;
		const {currentEditorState} = this.state;

		if (onContentChange) {
			onContentChange(this[TRANSFORM_OUTPUT](currentEditorState));
		}
	}


	onChange = (editorState, cb) => {
		const {onChange} = this.props;
		const {currentEditorState} = this.state;
		const contentChanged = currentEditorState.getCurrentContent() !== editorState.getCurrentContent()
			|| editorState.getLastChangeType() === 'apply-entity';
		this.hasPendingChanges = this.hasPendingChanges || contentChanged;

		this.setState({currentEditorState: editorState, currentEditorStateId: Date.now()}, () => {
			if (typeof cb === 'function') {
				cb();
			}

			if (onChange) {
				onChange(this[TRANSFORM_OUTPUT](editorState));
			}

			if (this.hasPendingChanges) {
				this.onContentChangeBuffered();
				this.hasPendingChanges = false;
			}

			if (this.editorContext) {
				this.editorContext.updateExternalLinks();
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
			this[INTERNAL_CHANGE](newState);
			return true;
		}

		return false;
	}


	render () {
		const {className, placeholder, readOnly, customKeyBindings} = this.props;
		const {currentEditorState:editorState, currentPlugins:plugins, busy, active} = this.state;

		const contentState = editorState && editorState.getCurrentContent();
		const hidePlaceholder = contentState && !contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled';
		const pluginClasses = plugins.map(x => x.editorClass);
		const pluginOverlays = plugins.map(x => x.overlayComponent).filter(x => x);

		const cls = cx(
			'nti-draft-core',
			'x-selectable',
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
							customKeyBindings={customKeyBindings}
							handleKeyCommand={this.handleKeyCommand}
							placeholder={placeholder}
							readOnly={readOnly || !active}
							onSetReadOnly={this.onSetReadOnly}
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
