import {EditorState, convertFromRaw} from 'draft-js';

export default function getStateForRaw (raw) {
	return EditorState.createWithContent(
		convertFromRaw(raw)
	);
}