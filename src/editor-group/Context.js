import EventsEmitter from 'events';

import React from 'react';
import PropTypes from 'prop-types';

class SelectedManager extends EventsEmitter {

	#focused = null;
	#parent = null;

	constructor (parent) {
		super();

		this.#parent = parent;
	}

	get focusedEditor () { return this.#focused; }

	setFocused (editor) {
		const changed = this.#focused !== editor;

		this.#focused = editor;

		if (changed) {
			this.emit('changed', editor);
		}

		this.#parent?.setFocused(editor);
	}

	clearFocused (editor) {
		if (this.#focused === editor) {
			this.setFocused(null);
		}

		this.#parent?.clearFocused(editor);
	}

	subscribeToFocused (fn) {
		this.addListener('changed', fn);
		return () => this.removeListener('changed', fn);
	}
}

const GlobalSelectedManager = new SelectedManager();
const Context = React.createContext(GlobalSelectedManager);

const useFocusedEditor = () => {
	const groupContext = React.useContext(Context);
	const [focused, setFocused] = React.useState(groupContext?.focusedEditor);

	React.useEffect(() => groupContext?.subscribeToFocused?.(setFocused), []);

	return focused;

};

EditorGroupContext.useFocusedEditor = useFocusedEditor;
EditorGroupContext.useGroup = () => React.useContext(Context);
EditorGroupContext.propTypes = {
	onFocusedChange: PropTypes.func,
	children: PropTypes.any
};
export default function EditorGroupContext ({onFocusedChange, children}) {
	const parentManager = React.useContext(Context);
	const managerRef = React.useRef(null);

	if (managerRef.current === null) {
		managerRef.current = new SelectedManager(parentManager);
	}

	React.useEffect(() => managerRef.current.subscribeToFocused(onFocusedChange), [onFocusedChange]);

	return (
		<Context.Provider value={managerRef.current}>
			{children}
		</Context.Provider>
	);
}
