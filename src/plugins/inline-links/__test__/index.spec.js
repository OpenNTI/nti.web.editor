/* eslint-env jest */
import {convertToRaw} from 'draft-js';

import getStateWithLinks from '../utils/__test__/get-state-with-links';
import {create} from '../index';

describe('inlineLinksPlugin', () => {
	test('Test inlineLinksPlugin', () => {
		const plugin = create();

		const editorState = getStateWithLinks();

		const newState = plugin.onChange(editorState);

		expect(convertToRaw(newState.getCurrentContent()).blocks[0].entityRanges[0].offset).toEqual(14);
		expect(convertToRaw(newState.getCurrentContent()).entityMap[0].data.href).toEqual('http://www.38footdart.com');
	});
});
