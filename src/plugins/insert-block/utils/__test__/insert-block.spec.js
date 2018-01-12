/* eslint-env jest */
import {EditorState, SelectionState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import insertBlock from '../insert-block';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

const currKey = 'curr';
const nextKey = 'next';
const newKey = 'newkey';
const protoBlock = {key: currKey, type: BLOCKS.UNSTYLED, depth: 0, text: 'block 1', inlineStyleRanges: [], entityRanges: []};
const atomicBlock = {key: nextKey, type: BLOCKS.ATOMIC, depth: 0, text: 'block 2', inlineStyleRanges: [], entityRanges: []};

const newBlock = {key: newKey, type: BLOCKS.ATOMIC, depth: 0, text: 'block 3', inlineStyleRanges: [], entityRanges: []};

const selection = new SelectionState({
	anchorKey: currKey,
	anchorOffset: 2,
	focusKey: currKey,
	focusOffset: 7
});

const editorState = createEditorState({
	blocks: [
		{...protoBlock},
		{...atomicBlock}
	],
	entityMap: {}
});

const editorStateWithNewBlock = createEditorState({
	blocks: [
		{...newBlock}
	],
	entityMap: {}
});

describe('insertBlock', () => {
	test('Test block is inserted, no replace', () => {
		const editorStateWithSelected = EditorState.forceSelection(editorState, selection);

		const result = insertBlock(editorStateWithNewBlock.getCurrentContent().getBlocksAsArray()[0], false, selection, editorStateWithSelected);

		const blocks = result.getCurrentContent().getBlocksAsArray();

		const blocksWithText = blocks.filter(x => x.text);

		expect(blocksWithText.length).toBe(3);
		expect(blocksWithText[0].text).toEqual('block 1');
		expect(blocksWithText[1].text).toEqual('block 3');
		expect(blocksWithText[2].text).toEqual('block 2');
	});

	test('Test block is inserted, no replace', () => {
		const editorStateWithSelected = EditorState.forceSelection(editorState, selection);

		const result = insertBlock(editorStateWithNewBlock.getCurrentContent().getBlocksAsArray()[0], true, selection, editorStateWithSelected);

		const blocks = result.getCurrentContent().getBlocksAsArray();

		const blocksWithText = blocks.filter(x => x.text);

		expect(blocksWithText.length).toBe(3);
		expect(blocksWithText[0].text).toEqual('bl');	// due to selection state and replace=true, the insertion replaced the remaining part of 'block 1'
		expect(blocksWithText[1].text).toEqual('block 3');
		expect(blocksWithText[2].text).toEqual('block 2');
	});
});
