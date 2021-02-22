/* eslint-env jest */
import { getLinksInBlock } from '../GetLinks';

describe('GetLinks', () => {
	describe('getLinksInBlock', () => {
		test('basic', () => {
			const blockKey = 'asdf';
			const block = {
				getText: () =>
					'www.google.com and not a link then www.facebook.com',
				getType: () => 'unstyled',
				getKey: () => blockKey,
			};

			const links = getLinksInBlock(block, {});

			expect(links.length).toBe(2);

			expect(links[0].text).toBe('www.google.com');
			expect(links[1].text).toBe('www.facebook.com');

			expect(links[0].selection.getAnchorKey()).toBe(blockKey);
			expect(links[0].selection.getFocusKey()).toBe(blockKey);
			expect(links[0].selection.getAnchorOffset()).toBe(0);
			expect(links[0].selection.getFocusOffset()).toBe(14);

			expect(links[1].selection.getAnchorKey()).toBe(blockKey);
			expect(links[1].selection.getFocusKey()).toBe(blockKey);
			expect(links[1].selection.getAnchorOffset()).toBe(35);
			expect(links[1].selection.getFocusOffset()).toBe(51);
		});
	});
});
