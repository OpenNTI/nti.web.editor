import { AtomicBlockUtils, SelectionState } from 'draft-js';

import { BLOCKS } from '../../../Constants';
import { isFocusablePlaceholder } from '../../keep-focusable-target';

const isInContent = (editorState, block) =>
	Boolean(editorState.getCurrentContent().getBlockForKey(block.getKey()));

function moveWithin(block, selection, editorState, insertionMode) {
	if (block.getType() === BLOCKS.ATOMIC) {
		try {
			return AtomicBlockUtils.moveAtomicBlock(
				editorState,
				block,
				selection,
				insertionMode
			);
		} catch (e) {
			//We are assuming if it throws its because the selection is next to the block
			return editorState;
		}
	}

	//NOTE: If/when we need to fill this in we need to look at what moveAtomicBlock is doing
	return editorState;
}

function moveOutside(block, prevEditorState, selection, newEditorState) {
	//TODO: fill this out
	return newEditorState;
}

export function toSelection(dragData, selection, editorState, onAdded) {
	return isInContent(editorState, dragData.block)
		? moveWithin(dragData.block, selection, editorState)
		: moveOutside(
				dragData.block,
				dragData.editorState,
				selection,
				editorState
		  );
}

function getTarget(contentBlock, editorState, direction = 1) {
	const next = block =>
		direction > 0
			? editorState.getCurrentContent().getBlockAfter(block.getKey())
			: editorState.getCurrentContent().getBlockBefore(block.getKey());

	let pointer = next(contentBlock);

	while (pointer) {
		const isTarget = !isFocusablePlaceholder(pointer);

		if (isTarget || !next(pointer)) {
			return pointer;
		}

		pointer = next(pointer);
	}

	return null;
}

export function up(contentBlock, editorState) {
	const target = getTarget(contentBlock, editorState, -1);

	if (!target) {
		return editorState;
	}

	const blockKey = target.getKey();
	const selection = new SelectionState({
		focusKey: blockKey,
		focusOffset: 0,
		anchorKey: blockKey,
		anchorOffset: 0,
	});

	return moveWithin(contentBlock, selection, editorState, 'before');
}

export function down(contentBlock, editorState) {
	const target = getTarget(contentBlock, editorState, 1);

	if (!target) {
		return editorState;
	}
	if (target.getType() === BLOCKS.ATOMIC) {
		const next = editorState
			.getCurrentContent()
			.getBlockAfter(target.getKey());

		if (next) {
			const blockKey = next.getKey();
			const selection = new SelectionState({
				focusKey: blockKey,
				focusOffet: 0,
				anchorKey: blockKey,
				anchorOffset: 0,
			});

			return moveWithin(contentBlock, selection, editorState, 'before');
		}
	}

	const blockKey = target.getKey();
	const blockLength = target.getLength();
	const selection = new SelectionState({
		focusKey: blockKey,
		focusOffset: blockLength,
		anchorKey: blockKey,
		anchorOffset: blockLength,
	});

	return moveWithin(contentBlock, selection, editorState, 'after');
}
