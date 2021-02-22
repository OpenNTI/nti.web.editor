import { RichUtils } from 'draft-js';

import { HANDLED, NOT_HANDLED } from '../Constants';

export const create = () => {
	return {
		isCorePlugin: true,

		handleKeyCommand(command, editorState, eventTime, { setEditorState }) {
			const newState = RichUtils.handleKeyCommand(editorState, command);

			if (newState) {
				setEditorState(newState);
				return HANDLED;
			}

			return NOT_HANDLED;
		},
	};
};
