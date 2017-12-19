import {ContentState, EditorState} from 'draft-js';

export default function stripPlaceholders (editorState) {
	const currentSelection = editorState.getSelection();
	const currentContent = editorState.getCurrentContent();
	const currentBlocks = currentContent.getBlocksAsArray();
	let newBlocks = [];

	for (let block of currentBlocks) {
		if (!block.data.get('focusablePlaceholder')) {
			newBlocks.push(block);
		}
	}

	if (newBlocks.length === currentBlocks.length) { return editorState; }

	let newContent = ContentState.createFromBlockArray(newBlocks)
		.merge({
			selectionBefore: currentSelection,
			selectionAfter: currentSelection
		});

	return EditorState.set(editorState, {
		currentContent: newContent
	});
}
