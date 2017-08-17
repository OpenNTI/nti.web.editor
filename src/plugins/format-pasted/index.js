import {EVENT_HANDLED, EVENT_NOT_HANDLED} from '../Constants';

import formatHTML from './formatHTML';
import transformNTIContent from './transformNTIContent';


const formatters = [
	formatHTML
];

function getStateForPasted (text, html, editorState, config) {
	for (let format of formatters) {
		if (format.shouldFormat(text, html, editorState, config)) {
			return format.format(text, html, editorState, config);
		}
	}
}

//https://github.com/facebook/draft-js/issues/416#issuecomment-221639163
export default {
	create: (config = {}) => {
		return {
			handlePastedText (text, html, editorState, {setEditorState}) {
				const transformedHTML = transformNTIContent(html);
				const newState = getStateForPasted(text, transformedHTML, editorState, config);

				if (!newState) { return EVENT_NOT_HANDLED; }

				setEditorState(newState);

				return EVENT_HANDLED;
			}
		};
	}
};
