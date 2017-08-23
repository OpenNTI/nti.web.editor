import {convertToHTML} from 'draft-js';

export default function fromDraftState (editorState) {
	return convertToHTML(editorState);
}
