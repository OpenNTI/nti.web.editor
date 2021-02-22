import { BLOCKS } from '../../Constants';

import { ensureFocusableBlocks, stripPlaceholders } from './utils';

export const create = (config = {}) => {
	const around = config.around || new Set([BLOCKS.CODE]);
	const between = config.between || new Set([BLOCKS.ATOMIC]);

	return {
		onChange(editorState) {
			return ensureFocusableBlocks(around, between, editorState);
		},

		transformOutput(editorState) {
			return editorState
				? stripPlaceholders(around, between, editorState)
				: editorState;
		},

		transformInput(editorState) {
			return editorState
				? ensureFocusableBlocks(around, between, editorState)
				: editorState;
		},
	};
};
