import {Modifier, EditorState} from 'draft-js';

import {getRangeForBlock} from '../../../utils';
import {CHANGE_TYPES, BLOCKS} from '../../../Constants';

export default function removeBlock (block, editorState) {
	const rangeToRemove = getRangeForBlock(block);

	const currentContent = editorState.getCurrentContent();
	const contentWithoutBlock = Modifier.removeRange(currentContent, rangeToRemove, 'backward');

	const resetBlock = Modifier.setBlockType(
		contentWithoutBlock,
		contentWithoutBlock.getSelectionAfter(),
		BLOCKS.UNSTYLED
	);

	const newState = EditorState.push(editorState, resetBlock, CHANGE_TYPES.REMOVE_RANGE);

	return EditorState.forceSelection(newState, resetBlock.getSelectionAfter());
}
