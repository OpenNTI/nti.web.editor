import {NOT_HANDLED, HANDLED} from '../../Constants.js';

import {ApplyAutoLinks} from './utils';

export const create = (config = {}) => {

	let backspaceAction = null;

	return {
		handleKeyCommand (command, editorState, eventTime, {setEditorState}) {
			if (command !== 'backspace' || !backspaceAction) { return NOT_HANDLED; }

			//TODO apply the undo action
		},

		handleBeforeInput (chars, editorState, eventTime, {setEditorState}) {
			const {editorState: newEditorState, undo} = ApplyAutoLinks.beforeInput(chars, editorState, config);

			backspaceAction = undo;

			if (newEditorState) {
				setEditorState(newEditorState);
				return HANDLED;
			}

			return NOT_HANDLED;
		}
	};
};