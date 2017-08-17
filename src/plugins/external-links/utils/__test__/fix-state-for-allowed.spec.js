/* eslint-env jest */
import fixStateForAllowed from '../fix-state-for-allowed';
import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';

import {getEditorState, getRawFromState} from './utils';

describe('fixStateForAllowed', () => {
	test('Removes links from invalid types, but leaves them in valid ones', () => {
		const editorState = getEditorState({
			blocks: [
				{
					type: BLOCKS.HEADER_ONE,
					depth: 0,
					text: 'Header with link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 12, length: 4, key: 0}
					]
				},{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'Paragraph with link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 15, length: 4, key: 0}
					]
				}
			],
			entityMap: {
				0: {
					type: ENTITIES.LINK,
					mutability: MUTABILITY.MUTABLE,
					data: {name: 0, href: 'www.google.com'}
				}
			}
		});

		const fixedState = fixStateForAllowed(editorState, new Set([BLOCKS.UNSTYLED]));
		const fixedRaw = getRawFromState(fixedState);

		expect(fixedRaw.blocks[0].entityRanges.length).toEqual(0);
		expect(fixedRaw.blocks[1].entityRanges.length).toEqual(1);
	});
});
