import {genKey, ContentBlock, ContentState, EditorState, Modifier, SelectionState} from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import {List, Map as ImmutableMap} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

import {BLOCKS} from '../../../Constants';

import generateChecksFor from './generate-checks-for';

function createFocusable () {
	return new ContentBlock({
		key: genKey(),
		type: BLOCKS.UNSTYLED,
		text: '',
		characterList: List(),
		data: new ImmutableMap({
			focusablePlaceholder: true
		})
	});
}

export default function ensureFocusableBlocks (around, between, editorState) {
	const {isFocusable, shouldInsertBefore} = generateChecksFor(around, between);

	const currentContent = editorState.getCurrentContent();
	const currentBlocks = currentContent.getBlocksAsArray();
	const currentTotal = currentBlocks.length;

	let newBlocks = [];
	let toConvertFromPlaceholder = [];

	for (let i = 0; i < currentTotal; i++) {
		const block = currentBlocks[i];
		const prev = currentBlocks[i - 1];

		if (shouldInsertBefore(block, prev)) {
			newBlocks.push(createFocusable());
		}

		if (block.data.get('focusablePlaceholder') && block.text) {
			toConvertFromPlaceholder.push(block.getKey());
		}

		newBlocks.push(block);
	}

	const last = newBlocks[newBlocks.length - 1];

	if (!last || !isFocusable(last)) {
		newBlocks.push(createFocusable());
	}

	//if we didn't add any new blocks
	if (currentTotal === newBlocks.length && !toConvertFromPlaceholder.length) { return editorState; }

	let newContent = ContentState.createFromBlockArray(newBlocks);

	for (let key of toConvertFromPlaceholder) {
		newContent = Modifier
			.setBlockData(newContent, SelectionState.createEmpty(key), new ImmutableMap({}));
	}

	newContent = newContent.merge({
		selectionBefore: currentContent.getSelectionBefore(),
		selectionAfter: currentContent.getSelectionAfter()
	});

	return EditorState.set(editorState, {
		currentContent: newContent,
		selection: newContent.getSelectionAfter()
	});
}
