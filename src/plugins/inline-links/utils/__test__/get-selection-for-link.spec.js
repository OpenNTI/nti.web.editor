/* eslint-env jest */
import linkifyIt from 'linkify-it';

import getSelectionForLink from '../get-selection-for-link';

import getStateWithLinks from './get-state-with-links';

const linkify = linkifyIt();

describe('getSelectionForLink', () => {
	test('Test getSelectionForLink', () => {
		const editorState = getStateWithLinks();

		const contentState = editorState.getCurrentContent();
		const blocks = contentState.getBlocksAsArray();
		const link = linkify.match('visit my site http://www.38footdart.com to see the dart distance record');

		const result = getSelectionForLink(link[0], blocks[0]);

		expect(result.anchorOffset).toEqual(14);
		expect(result.focusOffset).toEqual(39);
		expect(result.anchorKey).toEqual(blocks[0].getKey());
		expect(result.focusKey).toEqual(blocks[0].getKey());
	});
});
