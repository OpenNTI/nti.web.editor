/* eslint-env jest */
import {EditorState, SelectionState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import getSelectedText from '../get-selected-text';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

const currKey = 'curr';
const nextKey = 'next';
const protoBlock = {key: currKey, type: BLOCKS.UNSTYLED, depth: 0, text: 'block 1', inlineStyleRanges: [], entityRanges: []};
const atomicBlock = {key: nextKey, type: BLOCKS.ATOMIC, depth: 0, text: 'block 2', inlineStyleRanges: [], entityRanges: []};

describe('getSelectedText', () => {
	test('Test selected text matches selection range', () => {
		const selection = new SelectionState({
			anchorKey: currKey,
			anchorOffset: 3,
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

		const editorStateWithSelected = EditorState.forceSelection(editorState, selection);

		const result = getSelectedText(editorStateWithSelected);

		expect(result[0]).toEqual('ck 1');
	});

	test('Test null due to isCollapsed=true', () => {
		const editorState = createEditorState({
			blocks: [
				{...protoBlock},
				{...atomicBlock}
			],
			entityMap: {}
		});

		const result = getSelectedText(editorState);

		expect(editorState.getSelection().isCollapsed()).toBe(true);
		expect(result).toBe(null);
	});
});
