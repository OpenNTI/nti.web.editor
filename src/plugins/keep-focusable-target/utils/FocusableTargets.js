import { EditorState, ContentBlock, genKey, BlockMapBuilder } from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import { List, Map } from 'immutable'; //eslint-disable-line import/no-extraneous-dependencies

import { BLOCKS } from '../../../Constants';

const UnfocusableBlocks = new Set([BLOCKS.ATOMIC]);

const isFocusable = block => block && !UnfocusableBlocks.has(block.getType());

const focusablePlaceholderKey = 'focusableTargetPlaceholder';

function makePlaceholder() {
	return new ContentBlock({
		key: genKey(),
		type: BLOCKS.UNSTYLED,
		text: '',
		characterList: List(),
		data: Map({ [focusablePlaceholderKey]: true }),
	});
}

export function add(editorState) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	if (blocks.length === 0) {
		return editorState;
	}

	let changed = false;
	let newBlocks = [];

	for (let i = 0; i < blocks.length; i++) {
		const prev = newBlocks[newBlocks.length - 1];
		const block = blocks[i];

		//cleanup any placeholders that are no longer needed
		if (isPlaceholderFocusableTarget(prev) && isFocusable(block)) {
			//the prev block is a placeholder, but current block focusable so we can remove the prev
			newBlocks = newBlocks.slice(0, -1);
			changed = true;
		} else if (isFocusable(prev) && isPlaceholderFocusableTarget(block)) {
			//the current block is a placeholder, but the prev block is focusable so we don't need to keep the current block
			changed = true;
			continue;
		}

		if (!isFocusable(prev) && !isFocusable(block)) {
			newBlocks.push(makePlaceholder());
			changed = true;
		}

		newBlocks.push(block);
	}

	if (!isFocusable(newBlocks[newBlocks.length - 1])) {
		newBlocks.push(makePlaceholder());
		changed = true;
	}

	if (!changed) {
		return editorState;
	}

	const newBlockMap = BlockMapBuilder.createFromArray(newBlocks);
	const newContent = content.merge({
		blockMap: newBlockMap,
	});

	return EditorState.set(editorState, {
		currentContent: newContent,
	});
}

export function remove(editorState) {
	return editorState;
}

export function isPlaceholderFocusableTarget(block) {
	return (
		block?.getData().toJS()[focusablePlaceholderKey] &&
		block.getText() === ''
	);
}
