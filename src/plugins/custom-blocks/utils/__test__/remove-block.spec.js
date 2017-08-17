/* eslint-env jest */
import {EditorState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import removeBlock from '../remove-block';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

function getBlock (state, key) {
	const blocks = state.getCurrentContent().getBlocksAsArray();

	for (let block of blocks) {
		if (block.getKey() === key) {
			return block;
		}
	}

	return null;
}

describe('removeBlock tests', () => {
	test('turns block to an empty unstyled block', () => {
		const protoBlock = {type: BLOCKS.UNSTYLED, depth: 0, text: 'asdf', inlineStyleRanges: [], entityRanges: []};
		const atomicBlock = {type: BLOCKS.ATOMIC, depth: 0, text: '', inlineStyleRanges: [], entityRanges: []};

		const editorState = createEditorState({
			blocks: [
				{...protoBlock},
				{...atomicBlock},
				{...protoBlock},
				{...atomicBlock},
				{...protoBlock},
				{...atomicBlock}
			],
			entityMap: {}
		});

		const blocks = editorState.getCurrentContent().getBlocksAsArray();

		for (let block of blocks) {
			let newState = removeBlock(block, editorState);
			let newBlock = getBlock(newState, block.getKey());

			expect(newBlock.getText().length).toEqual(0);
			expect(newBlock.getType()).toEqual(BLOCKS.UNSTYLED);
		}
	});
});
