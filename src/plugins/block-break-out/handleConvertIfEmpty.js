import {RichUtils} from 'draft-js';

import {EVENT_HANDLED, EVENT_NOT_HANDLED} from '../Constants';

export default function handleConvertIfEmpty (convertTo, editorState, setEditorState) {
	const currentContent = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const currentBlock = currentContent.getBlockForKey(selection.getEndKey());

	if (currentBlock.getText() !== '') { return EVENT_NOT_HANDLED; }

	const newState = RichUtils.toggleBlockType(editorState, convertTo);

	setEditorState(newState);

	return EVENT_HANDLED;
}
