/* eslint-env jest */
import {convertFromRaw, EditorState} from 'draft-js';

import renderBlock from '../render-block';

describe('renderBlock', () => {
	test('Test various types', () => {
		const rawContent = {
			blocks: [
				{ text: 'some code', type: 'code-block', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'quote', type: 'blockquote', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {}
		};

		const content = convertFromRaw(rawContent);
		const editorState = EditorState.createWithContent(content);
		const blocks = content.getBlocksAsArray();

		const verifyBlock = (index, type, prefix, postfix, blockContent) => {
			const result = renderBlock(editorState, null, blocks[index], blocks[index].key);

			expect(result.type).toEqual(type);
			expect(result.prefix).toEqual(prefix);
			expect(result.postfix).toEqual(postfix);
			expect(result.content).toEqual(blockContent);
		};

		verifyBlock(0, 'code-block', '<pre>', '</pre>', 'some code');
		verifyBlock(1, 'unstyled', '<p>', '</p>', 'paragraph');
		verifyBlock(2, 'blockquote', '<blockquote>', '</blockquote>', 'quote');
	});
});
