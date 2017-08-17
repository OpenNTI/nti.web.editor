import {Modifier, EditorState, SelectionState} from 'draft-js';

function getSelection (content) {
	const blocks = content.getBlocksAsArray();
	const first = blocks[0];
	const last = blocks[blocks.length - 1];

	return new SelectionState({
		anchorKey: first.getKey(),
		anchorOffset: 0,
		focusKey: last.getKey(),
		focusOffset: last.getText().length
	});
}

export default function fixStateForAllowed (editorState) {
	const content = editorState.getCurrentContent();
	const selection = getSelection(content);

	const newContent = Modifier.applyEntity(content, selection, null);

	return EditorState.set(editorState, {currentContent: newContent});
}
