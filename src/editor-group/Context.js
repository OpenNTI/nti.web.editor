import EventsEmitter from 'events';

import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import PropTypes from 'prop-types';

class SelectedManager extends EventsEmitter {
	#focused = null;
	#defaultEditor = null;
	#parent = null;

	constructor(parent) {
		super();

		this.#parent = parent;
	}

	get focusedEditor() {
		return this.#focused || this.#defaultEditor;
	}

	setDefaultEditor(editor) {
		this.#defaultEditor = editor;

		if (!this.#focused) {
			this.emit('changed', editor);
		}
	}

	setFocused(editor) {
		const changed = this.#focused !== editor;

		this.#focused = editor;

		if (changed) {
			this.emit('changed', editor || this.#defaultEditor);
		}

		this.#parent?.setFocused(editor);
	}

	clearFocused(editor) {
		if (this.#focused === editor) {
			this.setFocused(null);
		}

		this.#parent?.clearFocused(editor);
	}

	subscribeToFocused(fn) {
		this.addListener('changed', fn);
		return () => this.removeListener('changed', fn);
	}
}

const GlobalSelectedManager = new SelectedManager();
const Context = React.createContext(GlobalSelectedManager);

const useFocusedEditor = () => {
	const groupContext = useContext(Context);
	const [focused, setFocused] = useState(groupContext?.focusedEditor);

	useEffect(() => groupContext?.subscribeToFocused?.(setFocused), []);

	return focused;
};

const useDefaultEditorRef = () => {
	const groupContext = useContext(Context);

	return useCallback(
		editor => groupContext?.setDefaultEditor(editor),
		[groupContext]
	);
};

EditorGroupContext.useFocusedEditor = useFocusedEditor;
EditorGroupContext.useDefaultEditorRef = useDefaultEditorRef;
EditorGroupContext.useGroup = () => useContext(Context);
EditorGroupContext.propTypes = {
	onFocusedChange: PropTypes.func,
	children: PropTypes.any,
};
export default function EditorGroupContext({ onFocusedChange, children }) {
	const parentManager = useContext(Context);
	const managerRef = useRef(null);

	if (managerRef.current === null) {
		managerRef.current = new SelectedManager(parentManager);
	}

	useEffect(
		() =>
			onFocusedChange &&
			managerRef.current.subscribeToFocused(onFocusedChange),
		[onFocusedChange]
	);

	return (
		<Context.Provider value={managerRef.current}>
			{children}
		</Context.Provider>
	);
}
