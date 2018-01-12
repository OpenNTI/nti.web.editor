/* eslint-env jest */
import getDefaultEditorState from '../../__test__/utils/default-editor-state';
import getRangeForBlock from '../get-range-for-block';
import { BLOCKS } from '../../Constants';

describe('getRangeForBlock', () => {
	test('Test getRangeForBlock returns correct range', () => {
		const editorState = getDefaultEditorState([BLOCKS.UNSTYLED]);
		const contentState = editorState.getCurrentContent();
		const block = contentState.getBlocksAsArray()[0];

		const result = getRangeForBlock(block);

		expect(result.anchorOffset).toEqual(0);
		expect(result.focusOffset).toEqual(9);
		expect(result.anchorKey).toEqual(block.getKey());
	});
});
