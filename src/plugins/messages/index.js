import ErrorMessage from './components/ErrorMessage';
import WarningMessage from './components/WarningMessage';

export const components = {ErrorMessage, WarningMessage};


export const create = () => {
	return {
		getContext (getEditorState, setEditorState, focus) {
			const context = {
				focusEditor: () => focus()
			};

			return {
				messages: {...context}
			};
		}
	};
};
