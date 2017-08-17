/* eslint-env jest */
import isEntityAtOffsetinSingleBlock from '../is-entity-at-offset-in-single-block';
import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';

import {getStateAndOffsetKeys} from './utils';

describe('is-entity-at-offset-in-single-block', () => {
	test('True is entity is in single block', () => {
		const {state, offsetKeys} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'test link',
					inlineStyleRanges: [],
					entityRanges: [
						{offset: 5, length: 4, key: 0}
					]
				}
			],
			entityMap: {
				0: {
					type: ENTITIES.LINK,
					mutability: MUTABILITY.MUTABLE,
					data: {href: 'www.google.com'}
				}
			}
		});

		expect(isEntityAtOffsetinSingleBlock(0, offsetKeys[0], state)).toBeTruthy();
	});

	//TODO: figure out how to test this, draft is creating a new entity for the second block
	// test('True is entity is in single block', () => {
	// 	const {state, offsetKeys} = getStateAndOffsetKeys({
	// 		blocks: [
	// 			{
	// 				type: BLOCKS.UNSTYLED,
	// 				depth: 0,
	// 				text: 'test link',
	// 				inlineStyleRanges: [],
	// 				entityRanges: [
	// 					{offset: 5, length: 4, key: 0}
	// 				]
	// 			},
	// 			{
	// 				type: BLOCKS.UNSTYLED,
	// 				depth: 0,
	// 				text: 'link test',
	// 				inlineStyleRange: [],
	// 				entityRanges: [
	// 					{offste: 0, length: 4, key: 0}
	// 				]
	// 			}
	// 		],
	// 		entityMap: {
	// 			0: {
	// 				type: ENTITIES.LINK,
	// 				mutability: MUTABILITY.MUTABLE,
	// 				data: {href: 'www.google.com'}
	// 			}
	// 		}
	// 	});

	// 	expect(isEntityAtOffsetinSingleBlock(0, offsetKeys[0], state)).toBeFalsy();
	// });
});
