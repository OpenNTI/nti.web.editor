import React from 'react';
import PropTypes from 'prop-types';

import IdRegistry from './IdRegistry';

export default class ContextProvider extends React.Component {
	static register (id, editor) {
		IdRegistry.register(id, editor);
	}


	static unregister (id, editor) {
		IdRegistry.unregister(id, editor);
	}


	static propTypes = {
		editor: PropTypes.shape({
			getPluginContext: PropTypes.func,

		}),
		editorID: PropTypes.string,
		children: PropTypes.element,

		/**
		 * Flag this instance as internal to Core. External ContextProviders add references to this one.
		 * @type {boolean}
		 */
		internal: PropTypes.bool
	}

	static childContextTypes = {
		editorContext: PropTypes.shape({
			editor: PropTypes.any,
			getSelection: PropTypes.func,
			plugins: PropTypes.object
		})
	}


	constructor (props) {
		super(props);

		this.externalLinks = [];
		this.register(props);
		this.addRegistryListener(props);
	}


	getChildContext () {
		const editor = this.getEditor();
		const pluginContext = editor && editor.getPluginContext();

		return {
			editorContext: {
				editor,
				plugins: pluginContext,
				get editorState () { return editor && editor.editorState; },
				get readOnly () { return editor && editor.readOnly; },
				getSelection: () => { return editor && editor.editorState && editor.editorState.getSelection(); },
				focusEditor: () => { return editor && editor.focus(); }
			}
		};
	}


	getEditor (props = this.props) {
		let {editor, editorID} = props;

		while (editor && editor.editor) {
			editor = editor.editor;
		}

		if (!editor && editorID) {
			editor = IdRegistry.get(editorID);
		}

		return editor;
	}


	componentDidUpdate (prevProps) {
		if (prevProps.editor !== this.props.editor) {
			this.unregister();
			this.register(this.props);
		}
	}

	
	componentWillUnmount () {
		this.externalLinks = [];
		this.unregister();
		this.removeRegistryListener();
	}
	
	
	updateExternalLinks () {
		for (let cmp of this.externalLinks) {
			if (cmp) {
				cmp.forceUpdate();
			}
		}
	}


	addRegistryListener (props = this.props) {
		const {editorID, internal} = props;

		this.removeRegistryListener(props);

		if (editorID && !internal) {
			IdRegistry.addListener(IdRegistry.getRegisterEvent(editorID), this.onEditorRegistered);
			IdRegistry.addListener(IdRegistry.getUnregisterEvent(editorID), this.onEditorUnregistered);
		}
	}


	removeRegistryListener (props = this.props) {
		const {editorID} = props;

		if (editorID) {
			IdRegistry.removeListener(IdRegistry.getRegisterEvent(editorID), this.onEditorRegistered);
			IdRegistry.removeListener(IdRegistry.getUnregisterEvent(editorID), this.onEditorUnregistered);
		}
	}


	onEditorRegistered = (editor) => {
		this.registerEditor(editor);
	}


	//link other instances of CoreContextProvider together.
	register (props = this.props) {
		if (!props.internal) {
			this.registerEditor(this.getEditor(props));
		}
	}


	registerEditor (editor) {
		if (editor && editor.editorContext) {
			editor.editorContext.addLink(this);
		}
	}


	addLink (otherContextProvider) {
		this.externalLinks = [...this.externalLinks, otherContextProvider];
	}


	onEditorUnregistered = (editor) => {
		this.unregisterEditor(editor);
	}


	unregister (props = this.props) {
		if (!props.internal) {
			this.unregisterEditor(this.getEditor(props));
		}
	}


	unregisterEditor (editor) {
		if (editor && editor.editorContext) {
			editor.editorContext.removeLink(this);
		}
	}


	removeLink (otherContextProvider) {
		this.externalLinks = this.externalLinks.filter(x => x !== otherContextProvider);
	}


	render () {
		return React.Children.only(this.props.children);
	}
}
