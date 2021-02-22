/* eslint-env jest */
import { convertFromRaw, EditorState } from 'draft-js';

import renderContentBlockContent from '../render-content-block-content';

describe('renderBlock', () => {
	test('Test various types', () => {
		const rawContent = {
			blocks: [
				{
					text: 'some code',
					type: 'code-block',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
				{
					text: 'paragraph',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
				{
					text: 'quote',
					type: 'blockquote',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
			],
			entityMap: {},
		};

		const content = convertFromRaw(rawContent);
		const editorState = EditorState.createWithContent(content);
		const blocks = content.getBlocksAsArray();
		const currContent = editorState.getCurrentContent();

		const verifyResult = (index, blockContent) => {
			const block = blocks[index];
			const tree = editorState.getBlockTree(block.getKey());

			const result = renderContentBlockContent(tree, block, currContent);

			expect(result).toEqual(blockContent);
		};

		verifyResult(0, 'some code');
		verifyResult(1, 'paragraph');
		verifyResult(2, 'quote');
	});
});
