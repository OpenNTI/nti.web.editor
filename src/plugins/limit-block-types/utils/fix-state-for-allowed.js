import { Modifier, EditorState } from 'draft-js';

import { BLOCKS, BLOCK_SET } from '../../../Constants';
import { getRangeForBlock } from '../../../utils';

function changeBlockType(block, content, defaultType) {
	return Modifier.setBlockType(content, getRangeForBlock(block), defaultType);
}

export default function fixStateForAllowed(
	editorState,
	allowed,
	defaultType = BLOCKS.UNSTYLED
) {
	//TODO: instead of just checking the size check that they are the same set
	if (allowed.size === BLOCK_SET.size) {
		return editorState;
	}

	let content = editorState.getCurrentContent();
	const originalContent = content;

	for (let block of content.getBlocksAsArray()) {
		if (!allowed.has(block.type) && block.type !== defaultType) {
			content = changeBlockType(block, content, defaultType);
		}
	}

	if (content === originalContent) {
		return editorState;
	}

	return EditorState.set(editorState, {
		currentContent: content,
	});
}
