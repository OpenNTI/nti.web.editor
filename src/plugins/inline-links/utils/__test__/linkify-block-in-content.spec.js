/* eslint-env jest */
import {convertToRaw} from 'draft-js';

import linkifyBlockInContent from '../linkify-block-in-content';

import getStateWithLinks from './get-state-with-links';

describe('linkifyBlockInContent', () => {
	test('Test linkifyBlockInContent', () => {
		const editorState = getStateWithLinks();

		const contentState = editorState.getCurrentContent();
		const blocks = contentState.getBlocksAsArray();

		const result = linkifyBlockInContent(blocks[0], contentState);

		expect(convertToRaw(result).blocks[0].entityRanges[0].offset).toEqual(14);
		expect(convertToRaw(result).entityMap[0].data.href).toEqual('http://www.38footdart.com');
	});
});
