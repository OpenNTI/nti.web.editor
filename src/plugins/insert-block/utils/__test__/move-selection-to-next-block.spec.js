/* eslint-env jest */
import {EditorState, SelectionState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import moveSelectionToNextBlock from '../move-selection-to-next-block';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

describe('moveSelectionToNextBlock for inserting a block', () => {
	test('Moves selection to next block', () => {
		const currKey = 'curr';
		const nextKey = 'next';
		const protoBlock = {key: currKey, type: BLOCKS.UNSTYLED, depth: 0, text: 'asdf', inlineStyleRanges: [], entityRanges: []};
		const atomicBlock = {key: nextKey, type: BLOCKS.ATOMIC, depth: 0, text: '', inlineStyleRanges: [], entityRanges: []};

		const selection = new SelectionState({
			anchorKey: currKey,
			anchorOffset: 0,
			focusKey: currKey,
			focusOffset: 0
		});

		const editorState = createEditorState({
			blocks: [
				{...protoBlock},
				{...atomicBlock}
			],
			entityMap: {},
			selection: selection
		});

		const newSelection = new SelectionState({
			anchorKey: nextKey,
			anchorOffset: 0,
			focusKey: nextKey,
			focusOffset: 0
		});

		expect(moveSelectionToNextBlock(editorState).getSelection()).toEqual(newSelection);
	});
});
