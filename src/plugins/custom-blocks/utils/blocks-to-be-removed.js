import {BLOCKS} from '../../../Constants';

function getBlocksInExpandedSelection (editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const startKey = selection.getStartKey();
	const endKey = selection.getEndKey();

	const toRemove = [];
	let pointer = content.getBlockForKey(startKey).getType() === BLOCKS.ATOMIC ? startKey : content.getKeyAfter(startKey);

	while (pointer) {
		toRemove.push(pointer);

		if (pointer === endKey) { break; }

		pointer = content.getKeyAfter(pointer);
	}

	return toRemove;
}


const Commands = {
	'backspace': (editorState) => {
		const selection = editorState.getSelection();

		if (!selection.isCollapsed()) { return getBlocksInExpandedSelection(editorState); }

		const content = editorState.getCurrentContent();
		const startKey = selection.getStartKey();
		const startOffset = selection.getStartOffset();

		//if we aren't at the beginning of a block nothing should get deleted
		if (startOffset !== 0) { return []; }

		const blockBefore = content.getBlockBefore(startKey);

		//If the block before is atomic, it will get backspaced out
		if (blockBefore?.getType() === BLOCKS.ATOMIC) {
			return [blockBefore.getKey()];
		}

		//else the current block will get removed
		return [startKey];
	},

	'delete': (editorState) => {
		const selection = editorState.getSelection();

		if (!selection.isCollapsed()) { return getBlocksInExpandedSelection(editorState); }

		const content = editorState.getCurrentContent();
		const endKey = selection.getEndKey();
		const endOffset = selection.getEndOffset();
		const length = content.getBlockForKey(endKey).getLength();

		//if we aren't at the end of a block nothing should get deleted
		if (endOffset < length) { return []; }

		const blockAfter = content.getBlockAfter(endKey);

		//No matter what on delete the next block will get removed. For text blocks their text will be added
		//to the selected block, but that block will still get removed.
		return [blockAfter.getKey()];
	}
};

export function command (commandName, editorState) {
	const handler = Commands[commandName];

	return handler ? handler(editorState) : [];
}

export function beforeInput (chars, editorState) {
	const selection = editorState.getSelection();

	return selection.isCollapsed() ? [] : getBlocksInExpandedSelection(editorState);
}
