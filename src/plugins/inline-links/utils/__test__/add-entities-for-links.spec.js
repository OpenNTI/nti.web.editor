/* eslint-env jest */
import {convertToRaw} from 'draft-js';

import addEntitiesForLinks from '../add-entities-for-links';

import getStateWithLinks from './get-state-with-links';

describe('addEntitiesForLinks', () => {
	test('Test addEntitiesForLinks', () => {
		const editorState = getStateWithLinks();

		const result = addEntitiesForLinks(editorState);

		expect(convertToRaw(result.getCurrentContent()).blocks[0].entityRanges[0].offset).toEqual(14);
		expect(convertToRaw(result.getCurrentContent()).entityMap[0].data.href).toEqual('http://www.38footdart.com');
	});
});
