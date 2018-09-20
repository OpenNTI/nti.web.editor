import {EditorState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../Constants';

export default function toDraftState (text) {
	if (!text) { return EditorState.createEmpty(); }

	if (text instanceof EditorState) {
		return text;
	}

	const block = {type: BLOCKS.UNSTYLED, depth: 0, text, inlineStyleRanges: [], entityRanges: []};

	const raw = {
		blocks: [
			{...block},
		],
		entityMap: {}
	};

	return EditorState.createWithContent(convertFromRaw(raw));
}
