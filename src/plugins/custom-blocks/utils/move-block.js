import {AtomicBlockUtils} from 'draft-js';

import {BLOCKS} from '../../../Constants';

const isInContent = (editorState, block) => Boolean(editorState.getCurrentContent().getBlockForKey(block.getKey()));

function moveWithin (block, selection, editorState) {
	if (block.getType() === BLOCKS.ATOMIC) {
		try {
			return AtomicBlockUtils.moveAtomicBlock(editorState, block, selection);
		} catch (e) {
			//We are assuming if it throws its because the selection is next to the block
			return editorState;
		}
	}

	//NOTE: If/when we need to fill this in we need to look at what moveAtomicBlock is doing
	return editorState;
}

function moveOutside (block, prevEditorState, selection, newEditorState) {
	//TODO: fill this out
	return newEditorState;
}

export function toSelection (dragData, selection, editorState, onAdded) {
	return isInContent(editorState, dragData.block) ?
		moveWithin(dragData.block, selection, editorState) :
		moveOutside(dragData.block, dragData.editorState, selection, editorState);
}

export function up () {

}

export function down () {

}
