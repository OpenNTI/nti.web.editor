/* eslint-env jest */
import {EditorState, SelectionState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import ensureMaintainSelection from '../ensure-maintain-selection';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

describe('ensureMaintainSelection for inserting a block', () => {
	test('Maintains selection at current block', () => {
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

		expect(ensureMaintainSelection(editorState).getSelection()).toEqual(selection);
	});
});
