/* eslint-env jest */
import {convertToRaw} from 'draft-js';

import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';
import removeEntityKeyAtOffset from '../remove-entity-key-at-offset';

import {getStateAndOffsetKeys} from './utils';


describe('removeEntityKeyAtOffset', () => {
	test('Removes Only Instance of Entity', () => {
		const {state, offsetKeys} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'This has a link',
					inlineStyles: [],
					entityRanges: [
						{offset: 10, length: 4, key: 0}
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

		const newState = removeEntityKeyAtOffset(0, offsetKeys[0], state);
		const newRaw = convertToRaw(newState.getCurrentContent());

		expect(Object.keys(newRaw.entityMap).length).toEqual(0);
		expect(newRaw.blocks[0].entityRanges.length).toEqual(0);
	});
});
