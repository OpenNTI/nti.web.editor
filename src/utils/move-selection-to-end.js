import {EditorState} from 'draft-js';

export default function moveSelectionToEnd (editorState) {
	const selection = editorState.getSelection();
	const currentContent = editorState.getCurrentContent();
	const lastBlock = currentContent.getLastBlock();

	if (!lastBlock) { return editorState; }

	const key = lastBlock.getKey();
	const length = lastBlock.getLength();

	const updatedSelection = selection.merge({
		focusKey: key,
		focusOffset: length,
		anchorKey: key,
		anchorOffset: length,
		hasFocus: true
	});

	return EditorState.forceSelection(editorState, updatedSelection);
}
