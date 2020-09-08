import {Modifier, SelectionState, EditorState} from 'draft-js';

import {BLOCKS} from '../../../Constants';

const UnfocusableBlocks = new Set([BLOCKS.ATOMIC]);

const isFocusable = block => block && !UnfocusableBlocks.has(block.getType());

const focusablePlaceholderKey = 'focusableTargetPlaceholder';

const getSelectionBeforeBlock = (block, content) => (
	new SelectionState({
		focusKey: block.getKey(),
		focusOffset: 0,
		anchorKey: block.getKey(),
		anchorOffset: 0
	})
);
const getSelectionAfterBlock = (block, content) => (
	new SelectionState({
		focusKey: block.getKey(),
		focusOffset: block.getLength(),
		anchorKey: block.getKey(),
		anchorOffset: block.getLength()
	})
);

function insertPlaceholder (before, after, content) {
	if (!before && !after) { return content; }

	const selection = after ? getSelectionAfterBlock(after, content) : getSelectionBeforeBlock(before, content);

	const afterSplit = Modifier.splitBlock(content, selection);
	const insertSelection = afterSplit.getSelectionAfter();

	const asUnstyled = Modifier.setBlockType(afterSplit, insertSelection, BLOCKS.UNSTYLED);
	const withMarker = Modifier.setBlockData(asUnstyled, insertSelection, {[focusablePlaceholderKey]: true});

	return withMarker;
}

function cleanupPlaceholder (block, content) {
	const prev = content.getBlockBefore(block.getKey());
	const next = content.getBlockAfter(block.getKey());

	const anchor = prev ? ({key: prev.getKey(), offset: prev.getLength()}) : ({key: block.getKey(), offset: 0});
	const focus = !prev && next ? ({key: next.getKey(), offset: next.getLength()}) : ({key: block.getKey(), offset: block.getLength()});

	const selection = new SelectionState({
		anchorKey: anchor.key,
		anchorOffset: anchor.offset,
		focusKey: focus.key,
		focusOffset: focus.offset
	});

	return Modifier.removeRange(content, selection, 'backward');
}


export function add (editorState) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	if (blocks.length === 0) { return editorState; }

	let newContent = content;

	//This is not a typo, we are iterating past the last block
	//to account for there being an unfocusable block at the end
	for (let i = 0; i <= blocks.length; i++) {
		const prev = blocks[i - 1];
		const block = blocks[i];

		if (isPlaceholderFocusableTarget(prev) && isFocusable(block)) {
			newContent = cleanupPlaceholder(prev, content);
		} else if (isFocusable(prev) && isPlaceholderFocusableTarget(block)) {
			newContent = cleanupPlaceholder(block, content);
		}

		if (isFocusable(prev) || isFocusable(block)) { continue; }

		newContent = insertPlaceholder(block, prev, newContent);
	}

	if (content === newContent) { return editorState; }

	return EditorState.set(editorState, {
		currentContent: newContent,
		selection: content.getSelectionAfter()
	});
}

export function remove (editorState) {
	return editorState;
}

export function isPlaceholderFocusableTarget (block) {
	return block?.getData().toJS()[focusablePlaceholderKey];
}
