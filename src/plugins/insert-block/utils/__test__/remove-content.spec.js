/* eslint-env jest */
import { EditorState, SelectionState, convertFromRaw } from 'draft-js';

import { BLOCKS } from '../../../../Constants';
import removeContent from '../remove-content';

function createEditorState(raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

const currKey = 'curr';
const protoBlock = {
	key: currKey,
	type: BLOCKS.UNSTYLED,
	depth: 0,
	text: 'block 1',
	inlineStyleRanges: [],
	entityRanges: [],
};

describe('removeContent', () => {
	test('Test removeContent', () => {
		const selection = new SelectionState({
			anchorKey: currKey,
			anchorOffset: 1,
			focusKey: currKey,
			focusOffset: 6,
		});

		const editorState = createEditorState({
			blocks: [{ ...protoBlock }],
			entityMap: {},
		});

		const editorStateWithSelected = EditorState.forceSelection(
			editorState,
			selection
		);

		const result = removeContent(
			editorStateWithSelected.getCurrentContent(),
			selection
		);

		expect(result.getBlocksAsArray()[0].text).toEqual('b1');
		expect(result.getSelectionAfter().anchorOffset).toEqual(1);
		expect(result.getSelectionAfter().focusOffset).toEqual(1);
	});
});
