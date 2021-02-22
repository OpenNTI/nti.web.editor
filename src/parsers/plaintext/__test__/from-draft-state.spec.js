/* eslint-env jest */
import { convertFromRaw, EditorState } from 'draft-js';

import fromDraftState from '../from-draft-state';

describe('DraftState to plaintext', () => {
	test('Should concatenate text from blocks', () => {
		const rawContent = {
			blocks: [
				{
					text: 'text',
					type: 'header-one',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
				{
					text: 'all',
					type: 'header-two',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
				{
					text: 'concatenated',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
			],
			entityMap: {},
		};

		const content = convertFromRaw(rawContent);
		const editorState = EditorState.createWithContent(content);

		const value = fromDraftState(editorState);

		expect(value).toEqual(['text\nall\nconcatenated']);
	});
});
