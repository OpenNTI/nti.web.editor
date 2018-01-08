/* eslint-env jest */
import { convertFromRaw } from 'draft-js';

import getBlockTags from '../get-block-tags';

describe('getBlockTags', () => {
	test('Test various tag types', () => {
		const rawContent = {
			blocks: [
				{ text: 'title', type: 'header-one', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'sub-title', type: 'header-two', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {}
		};

		const content = convertFromRaw(rawContent);
		const blocks = content.getBlocksAsArray();

		const h2block = getBlockTags(blocks[1], blocks[0], blocks[2]);
		expect(h2block).toEqual(['<h2>', '</h2>']);

		const liBlock = getBlockTags(blocks[4], blocks[3], blocks[5]);
		expect(liBlock).toEqual(['<li>', '</li>']);

		const olStart = getBlockTags(blocks[3], blocks[2], blocks[4]);
		expect(olStart).toEqual(['<ol><li>', '</li>']);

		const olEnd = getBlockTags(blocks[5], blocks[4], blocks[6]);
		expect(olEnd).toEqual(['<li>', '</li></ol>']);

		const ulStart = getBlockTags(blocks[6], blocks[5], blocks[7]);
		expect(ulStart).toEqual(['<ul><li>', '</li>']);

		const ulEnd = getBlockTags(blocks[7], blocks[6], blocks[8]);
		expect(ulEnd).toEqual(['<li>', '</li></ul>']);
	});
});
