import { genKey, ContentBlock, EditorState } from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import { List } from 'immutable';  

import { HANDLED, NOT_HANDLED } from '../Constants';

function getStartOrEnd(selection, currentBlock) {
	const endOffset = selection.getEndOffset();

	return {
		startOfBlock: endOffset === 0,
		endOfBlock: endOffset === currentBlock.getLength(),
	};
}

function buildNewBlock(type) {
	return new ContentBlock({
		key: genKey(),
		text: '',
		type,
		characterList: List(),
		depth: 0,
	});
}

function getBlocksAround(currentContent, currentBlock) {
	const blockMap = currentContent.getBlockMap();

	return {
		before: blockMap.toSeq().takeUntil(x => x === currentBlock),
		after: blockMap.toSeq().skipUntil(x => x === currentBlock),
	};
}

function getAugmentedState(currentBlock, newBlock, endOfBlock) {
	let blocks;
	let focus;

	if (endOfBlock) {
		blocks = [
			[currentBlock.getKey(), currentBlock],
			[newBlock.getKey(), newBlock],
		];

		focus = newBlock.getKey();
	} else {
		blocks = [
			[newBlock.getKey(), newBlock],
			[currentBlock.getKey(), currentBlock],
		];

		focus = currentBlock.getKey();
	}

	return { blocks, focus };
}

/**
 * Taken from https://github.com/icelab/draft-js-block-breakout-plugin
 * inserts a new type either before or after the current selected block
 *
 * @param  {string} breakToType    the type to break to
 * @param  {Object} editorState    the current state of the editor
 * @param  {Function} setEditorState call back to set the new editor state
 * @returns {string}                [HANDLED | NOT_HANDLED] to indicate if we handled it
 */
export default function (breakToType, editorState, setEditorState) {
	const selection = editorState.getSelection();
	const currentContent = editorState.getCurrentContent();
	const currentBlock = currentContent.getBlockForKey(selection.getEndKey());
	const { startOfBlock, endOfBlock } = getStartOrEnd(selection, currentBlock);

	if (!startOfBlock && !endOfBlock) {
		return NOT_HANDLED;
	}

	const newBlock = buildNewBlock(breakToType);
	const { before, after } = getBlocksAround(currentContent, currentBlock);
	const { blocks, focus } = getAugmentedState(
		currentBlock,
		newBlock,
		endOfBlock
	);

	const newState = currentContent.merge({
		blockMap: before.concat(blocks, after).toOrderedMap(),
		selectionBefore: selection,
		selectionAfter: selection.merge({
			anchorKey: focus,
			anchorOffset: 0,
			focusKey: focus,
			focusOffset: 0,
			isBackward: false,
		}),
	});

	setEditorState(EditorState.push(editorState, newState, 'split-block'));

	return HANDLED;
}
