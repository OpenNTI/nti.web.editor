import './Editor.scss';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAgent from 'fbjs/lib/UserAgent';
import { EditorState } from 'draft-js';

import { buffer } from '@nti/lib-commons';
import { parent } from '@nti/lib-dom';

import ContextProvider from '../ContextProvider';
import { HANDLED, NOT_HANDLED } from '../plugins/Constants';
import * as CorePlugin from '../plugins/core';
import EditorGroup from '../editor-group';

import { decomposePlugins } from './utils';
import Editor from './BaseEditor';
import NestedWrapper from './NestedEditorWrapper';
import ErrorBoundary from './ErrorBoundary';

const CONTENT_CHANGE_BUFFER = 1000;

const INTERNAL_CHANGE = Symbol('Internal Change');
const TRANSFORM_OUTPUT = Symbol('Transform Output');
const TRANSFORM_INPUT = Symbol('Transform Input');

//TODO: move the allowed(InlineStyle, BlockTypes, Links) to plugins instead of props
class DraftCoreEditor extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		id: PropTypes.string,

		editorState: PropTypes.object.isRequired,
		plugins: PropTypes.array,
		customKeyBindings: PropTypes.object,
		placeholder: PropTypes.string,
		readOnly: PropTypes.bool,
		autoFocus: PropTypes.bool,
		autoNest: PropTypes.bool,

		contentChangeBuffer: PropTypes.number,

		onChange: PropTypes.func,
		onContentChange: PropTypes.func,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		handleKeyCommand: PropTypes.func,
	};

	static defaultProps = {
		editorState: EditorState.createEmpty(),
		plugins: [],

		allowKeyBoardShortcuts: true,

		contentChangeBuffer: CONTENT_CHANGE_BUFFER,
	};

	static contextTypes = {
		draftCoreEditor: PropTypes.shape({
			parentEditor: PropTypes.shape({
				deactivate: PropTypes.func,
				activate: PropTypes.func,
			}),
		}),
	};

	static childContextTypes = {
		draftCoreEditor: PropTypes.shape({
			parentEditor: PropTypes.shape({
				deactivate: PropTypes.func,
				activate: PropTypes.func,
			}),
		}),
	};

	static getDerivedStateFromProps(props, state) {
		return {
			currentPlugins: [
				...decomposePlugins(props.plugins),
				CorePlugin.create(),
			],
		};
	}

	attachContextRef = r => (this.editorContext = r);
	attachEditorRef = r => (this.draftEditor = r);
	attachContainerRef = r => {
		this.editorContainer = r;

		if (r) {
			this.setupContainerListeners(r);
		} else {
			this.removeContainerListeners();
		}
	};

	constructor(props) {
		super(props);

		const { contentChangeBuffer, editorState } = props;

		this.onContentChangeBuffered = buffer(
			contentChangeBuffer,
			this.onContentChange
		);

		this.wasActive = true;

		this.state = {
			currentEditorState: this[TRANSFORM_INPUT](editorState),
			currentEditorStateId: Date.now(),
			active: true,
		};
	}

	get container() {
		return this.editorContainer;
	}

	get editorState() {
		return this.state.currentEditorState;
	}

	get editorStateId() {
		return this.state.currentEditorStateId;
	}

	get readOnly() {
		return this.draftEditor?.readOnly;
	}

	get parentEditor() {
		const { draftCoreEditor } = this.context;
		const { parentEditor } = draftCoreEditor || {};

		return parentEditor;
	}

	getChildContext() {
		const { parentEditor } = this;

		//Its less than ideal to track this in two places, but there
		//is a race condition between setting the state being applied and
		//and activate/deactivate event being triggered

		return {
			draftCoreEditor: {
				parentEditor: {
					activate: () => {
						if (!this.wasActive) {
							this.wasActive = true;
							this.setState({ active: true });
						}

						if (parentEditor) {
							parentEditor.activate();
						}
					},
					deactivate: () => {
						if (this.wasActive) {
							this.wasActive = false;
							this.setState({ active: false });
						}

						if (parentEditor) {
							parentEditor.deactivate();
						}
					},
				},
			},
		};
	}

	getPluginContext = () => {
		const { plugins } = this.props;
		let context = {};

		for (let plugin of plugins) {
			if (plugin.getContext) {
				let pluginContext = plugin.getContext(
					() => this.getEditorState(),
					(state, cb) => this.setEditorState(state, cb),
					() => this.focus(),
					plugins
				);
				context = { ...context, ...pluginContext };
			}
		}

		return context;
	};

	//This is used internally by plugins so it needs to not transform the state
	getEditorState = () => {
		return this.editorState;
	};

	setEditorState = (state, cb) => {
		this[INTERNAL_CHANGE](state, cb);
	};

	[INTERNAL_CHANGE](editorState, cb) {
		const { plugins } = this.props;
		const pluginMethods = this.draftEditor?.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.onChange) {
				editorState = plugin.onChange(editorState, pluginMethods);
			}
		}

		this.onChange(editorState, cb);
	}

	[TRANSFORM_OUTPUT](editorState) {
		const { plugins } = this.props;
		const pluginMethods = this.draftEditor?.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.transformOutput) {
				editorState = plugin.transformOutput(
					editorState,
					pluginMethods
				);
			}
		}

		return editorState;
	}

	[TRANSFORM_INPUT](editorState) {
		const { plugins } = this.props;
		const pluginMethods = this.draftEditor?.getPluginMethods();

		for (let plugin of plugins) {
			if (plugin.transformInput) {
				editorState = plugin.transformInput(editorState, pluginMethods);
			}
		}

		return editorState;
	}

	componentDidMount() {
		const { plugins, id, autoFocus } = this.props;

		for (let plugin of plugins) {
			if (plugin.setEditor) {
				plugin.setEditor(this);
			}
		}

		if (id) {
			ContextProvider.register(id, this);
		}

		if (autoFocus) {
			requestAnimationFrame(() => this.focusToEnd());
		}
	}

	componentWillUnmount() {
		const { plugins, id } = this.props;

		for (let plugin of plugins) {
			if (plugin.setEditor) {
				plugin.setEditor(null);
			}
		}

		if (id) {
			ContextProvider.unregister(id, this);
		}
	}

	componentDidUpdate(prevProps) {
		const {
			editorState: newEditorState,
			contentChangeBuffer: newContentChangeBuffer,
		} = this.props;
		const {
			editorState: oldEditorState,
			contentChangeBuffer: oldContentChangeBuffer,
		} = prevProps;

		if (newContentChangeBuffer !== oldContentChangeBuffer) {
			this.onContentChangeBuffered = buffer(
				newContentChangeBuffer,
				this.onContentChange
			);
		}

		if (newEditorState !== oldEditorState) {
			this.setState({
				currentEditorState: this[TRANSFORM_INPUT](newEditorState),
				currentEditorStateId: Date.now(),
			});
		}
	}

	focusToEnd = () => {
		const { editorState } = this;

		this.focus();
		this.onChange(EditorState.moveFocusToEnd(editorState));
	};

	focus = () => {
		this.draftEditor?.focus();
	};

	setupContainerListeners(container) {
		if (!this.parentEditor) {
			return;
		}

		this.removeContainerListeners();

		container.addEventListener('focusin', this.onContainerFocus, true);
		container.addEventListener('focusout', this.onContainerBlur, true);

		this.unsubscribeFromContainer = () => {
			container.removeEventListener(
				'focusin',
				this.onContainerFocus,
				true
			);
			container.removeEventListener(
				'focusout',
				this.onContainerBlur,
				true
			);
		};
	}

	removeContainerListeners() {
		if (this.unsubscribeFromContainer) {
			this.unsubscribeFromContainer();
			this.unsubscribeFromContainer = () => {};
		}
	}

	onContainerFocus = e => {
		const { parentEditor } = this;

		if (parentEditor) {
			e.stopPropagation();
			parentEditor.deactivate();
		}
	};

	onContainerBlur = e => {
		const { parentEditor } = this;

		if (parentEditor) {
			e.stopPropagation();
			parentEditor.activate();
		}
	};

	onSetReadOnly = () => {
		if (this.editorContext) {
			this.editorContext.updateExternalLinks();
		}
	};

	onContentChange = () => {
		const { onContentChange } = this.props;
		const { currentEditorState } = this.state;

		if (onContentChange) {
			onContentChange(this[TRANSFORM_OUTPUT](currentEditorState));
		}
	};

	onChange = async (editorState, cb) => {
		editorState = EditorState.set(editorState, {
			nativelyRenderedContent: null,
		});

		const { onChange } = this.props;
		const { currentEditorState } = this.state;
		const contentChanged =
			currentEditorState.getCurrentContent() !==
				editorState.getCurrentContent() ||
			editorState.getLastChangeType() === 'apply-entity';
		this.hasPendingChanges = this.hasPendingChanges || contentChanged;

		await new Promise(f =>
			this.setState(
				{
					currentEditorState: editorState,
					currentEditorStateId: Date.now(),
				},
				f
			)
		);

		cb?.call?.();
		onChange?.(this[TRANSFORM_OUTPUT](editorState));

		if (this.hasPendingChanges) {
			this.onContentChangeBuffered();
			this.hasPendingChanges = false;
		}

		if (this.editorContext) {
			this.editorContext.updateExternalLinks();
		}

		if (editorState.getSelection().getHasFocus() && !this.focused) {
			this.onFocus();
		}
	};

	onFocus = e => {
		const { onFocus } = this.props;

		this.focused = true;

		if (onFocus) {
			onFocus(this, e);
		}
	};

	onBlur = e => {
		const { onBlur } = this.props;

		this.focused = false;

		if (onBlur) {
			onBlur(this, e);
		}
	};

	handleKeyCommand = command => {
		const { handleKeyCommand } = this.props;

		//If the prop handles the key command let it
		if (handleKeyCommand && handleKeyCommand(command)) {
			return HANDLED;
		}

		return NOT_HANDLED;
	};

	render() {
		const {
			className,
			placeholder,
			readOnly,
			customKeyBindings,
			autoNest,
		} = this.props;
		const {
			currentEditorState: editorState,
			currentPlugins: plugins,
			busy,
			active,
		} = this.state;

		const contentState = editorState?.getCurrentContent();
		const hidePlaceholder =
			!contentState?.hasText() &&
			contentState?.getBlockMap().first().getType() !== 'unstyled';
		const pluginClasses = plugins.map(x => x.editorClass);
		const pluginOverlays = plugins
			.map(x => x.overlayComponent)
			.filter(x => x);

		const WrapperCmp =
			this.parentEditor && autoNest ? NestedWrapper : 'div';

		const cls = cx(
			'nti-draft-core',
			'x-selectable',
			className,
			pluginClasses,
			{
				busy,
				'auto-hyphenate': UserAgent.isBrowser('Firefox'), // || UserAgent.isBrowser('IE')
				'hide-placeholder': hidePlaceholder,
				'read-only': readOnly,
			}
		);

		return (
			<div
				ref={this.attachContainerRef}
				className="nti-draft-core-container"
				onFocus={this.onContainerFocus}
				onBlur={this.onContainerBlur}
			>
				<ContextProvider
					editor={this}
					ref={this.attachContextRef}
					internal
				>
					<WrapperCmp className={cls} onClick={this.focus}>
						<ErrorBoundary>
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
								spellCheck
							/>
						</ErrorBoundary>
					</WrapperCmp>
				</ContextProvider>
				{pluginOverlays.length
					? pluginOverlays.map((x, index) =>
							React.createElement(x, {
								key: index,
								getEditorState: this.getEditorState,
								setEditorState: this.setEditorState,
								editor: this,
							})
					  )
					: null}
			</div>
		);
	}
}

function isNestedFocusEvent(editor, e) {
	const parentContainer = parent(e.target, '.nti-draft-core-container');

	return parentContainer !== editor.editorContainer;
}

const DraftCoreEditorWrapper = React.forwardRef(
	({ onFocus, onBlur, ...otherProps }, ref) => {
		const editorGroup = EditorGroup.useGroup();
		const blurTimeout = React.useRef();

		const onInnerFocus = (editor, e) => {
			if (e && isNestedFocusEvent(editor, e)) {
				return;
			}

			clearTimeout(blurTimeout.current);
			blurTimeout.current = null;

			editorGroup.setFocused(editor);
			onFocus?.(editor);
		};

		const onInnerBlur = (editor, e) => {
			if (e && isNestedFocusEvent(editor, e)) {
				return;
			}

			//Do this in a timeout, so that if another editor
			//in the group is gaining focus there won't be two
			//render passes
			blurTimeout.current = setTimeout(() => {
				editorGroup.clearFocused(editor);
			}, 1);

			onBlur?.(editor);
		};

		return (
			<DraftCoreEditor
				ref={ref}
				onFocus={onInnerFocus}
				onBlur={onInnerBlur}
				{...otherProps}
			/>
		);
	}
);

DraftCoreEditorWrapper.propTypes = {
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
};

export default DraftCoreEditorWrapper;
