import {NOT_HANDLED, HANDLED} from '../../Constants.js';
import {create as CreateDecorate} from '../decorate';

import {ApplyAutoLinks} from './utils';

export const create = (config = {}) => {

	let changeHandled = false;

	return {
		plugins: [
			CreateDecorate()
		],


		onChange (editorState) {
			if (changeHandled) {
				changeHandled = false;
				return editorState;
			}

			return ApplyAutoLinks.onChange(editorState, config);
		},

		handleBeforeInput (chars, editorState, eventTime, {setEditorState}) {
			const newEditorState = ApplyAutoLinks.beforeInput(chars, editorState, config);

			if (newEditorState) {
				changeHandled = true;
				setEditorState(newEditorState);
				return HANDLED;
			}

			return NOT_HANDLED;
		}
	};
};