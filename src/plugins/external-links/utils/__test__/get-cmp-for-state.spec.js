/* eslint-env jest */
import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';
import getCmpForState from '../get-cmp-for-state';

import {getStateAndOffsetKeys} from './utils';

describe('getCmpForState', () => {
	test('Gets last link in same block', () => {
		const {offsetKeys, state} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'this as a link and another link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 10, length: 4, key: 0},
						{offset: 27, length: 4, key: 0}
					]
				}
			],
			entityMap: {
				0: {
					type: ENTITIES.LINK,
					mutability: MUTABILITY.MUTABLE,
					data: {name: 0, href: 'http://www.google.com'}
				}
			}
		});

		const cmp = getCmpForState(offsetKeys.map(x => { return {offsetKey: x}; }), state);

		expect(cmp.offsetKey).toEqual(offsetKeys[offsetKeys.length - 1]);
	});

	test('Gets last link in multiple blocks', () => {
		const {offsetKeys, state} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'this has a link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 11, length: 4, key: 0}
					]
				},
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'this has a link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 11, length: 4, key: 0}
					]
				}
			],
			entityMap: {
				0: {
					type: ENTITIES.LINK,
					mutability: MUTABILITY.MUTABLE,
					data: {name: 0, href: 'http://www.google.com'}
				}
			}
		});

		const cmp = getCmpForState(offsetKeys.map(x => { return {offsetKey: x}; }), state);

		expect(cmp.offsetKey).toEqual(offsetKeys[offsetKeys.length - 1]);
	});
});
