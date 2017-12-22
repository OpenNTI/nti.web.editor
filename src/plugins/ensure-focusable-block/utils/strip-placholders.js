import {ContentState, EditorState} from 'draft-js';

import isFocusablePlaceholder from './is-focusable-placeholder-block';
// import generateChecksFor from './generate-checks-for';

export default function stripPlaceholders (around, between, editorState) {
	// const {isFocusable} = generateChecksFor(around, between);

	const currentSelection = editorState.getSelection();
	const currentContent = editorState.getCurrentContent();
	const currentBlocks = currentContent.getBlocksAsArray();
	let newBlocks = [];

	for (let i = 0;  i < currentBlocks.length; i++) {
		const block = currentBlocks[i];
		// const prevBlock = currentBlocks[i - 1];
		// const nextBlock = currentBlocks[i + 1];

		if (!isFocusablePlaceholder(block)) {
			newBlocks.push(block);
		}

		//For now since draft is stripping empty paragraphs from the html this won't work
		// if (prevBlock && !isFocusable(prevBlock) && nextBlock && !isFocusable(nextBlock)) {
		// 	newBlocks.push(block);
		// }
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
