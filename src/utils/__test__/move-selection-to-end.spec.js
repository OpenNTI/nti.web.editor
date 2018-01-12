/* eslint-env jest */
import getDefaultEditorState from '../../__test__/utils/default-editor-state';
import moveSelectionToEnd from '../move-selection-to-end';
import { BLOCKS } from '../../Constants';

describe('getRangeForBlock', () => {
	test('Test getRangeForBlock returns correct range', () => {
		const editorState = getDefaultEditorState([BLOCKS.UNSTYLED]);

		const result = moveSelectionToEnd(editorState);

		const lastBlock = result.getCurrentContent().getBlocksAsArray()[1];

		const selection = result.getSelection();

		expect(selection.anchorKey).toEqual(lastBlock.getKey());
		expect(selection.anchorOffset).toEqual(lastBlock.getText().length);
		expect(selection.focusOffset).toEqual(lastBlock.getText().length);
	});
});
