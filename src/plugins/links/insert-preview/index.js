import {LinkTracker} from './utils';

export const create = (config = {}) => {
	const linkTracker = new LinkTracker(config);

	return {
		onChange (editorState) {
			const fixedEditorState = linkTracker.fixEditorState(editorState);

			return fixedEditorState;
		}
	};
};