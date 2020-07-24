/* eslint-env jest */
import {convertFromRaw, convertToRaw, SelectionState} from 'draft-js';

import {BLOCKS, ENTITIES} from '../../../../../Constants';
import {applyLinks} from '../ApplyLinks';

describe('ApplyLinks', () => {
	describe('applyLinks', () => {
		test('basic adding new links', () => {
			const content = convertFromRaw({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'www.google.com thats a link',
						inlineStyleRange: [],
						entityRanges: []
					}
				],
				entityMap: {}
			});

			const blockKey = content.getBlocksAsArray()[0].getKey();

			const links = [
				{
					selection: new SelectionState({
						anchorKey: blockKey,
						anchorOffset: 0,
						focusKey: blockKey,
						focusOffset: 14
					}),
					text: 'www.google.com',
					url: 'https://www.google.com'
				}
			];

			const linkifiedContent = convertToRaw(applyLinks(links, content));

			expect(linkifiedContent.blocks.length).toBe(1);
			expect(linkifiedContent.blocks[0].text).toBe('www.google.com thats a link');
			expect(linkifiedContent.blocks[0].inlineStyleRanges.length).toBe(0);
			expect(linkifiedContent.blocks[0].entityRanges.length).toBe(1);
			expect(linkifiedContent.blocks[0].entityRanges[0].offset).toBe(0);
			expect(linkifiedContent.blocks[0].entityRanges[0].length).toBe(14);

			const entity = linkifiedContent.entityMap[linkifiedContent.blocks[0].entityRanges[0].key];

			expect(entity.type).toBe(ENTITIES.LINK);
			expect(entity.data.href).toBe('https://www.google.com');
		});
	});
});