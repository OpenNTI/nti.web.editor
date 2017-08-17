/* eslint-env jest */
import {convertToRaw, RichUtils, Entity, SelectionState} from 'draft-js';

import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';
import createNewLinkAtOffset from '../create-new-link-at-offset';

import {getStateAndOffsetKeys, getOffsetKeys} from './utils';

describe('create-new-link-at-offset', () => {
	test('Creates one link if entity is in one block, and replaces text', () => {
		const {state, offsetKeys} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'a block with a link',
					inlineStyleRanges: [],
					entityRanges: [{offset: 15, length: 4, key: 0}]
				}
			],
			entityMap: {
				0: {
					type: ENTITIES.LINK,
					mutability: MUTABILITY.MUTABLE,
					data: {name: 0, href: ''}
				}
			}
		});

		const newState = createNewLinkAtOffset('http://www.google.com', 'entity', 0, offsetKeys[0], state);
		const newRaw = convertToRaw(newState.getCurrentContent());

		expect(Object.keys(newRaw.entityMap).length).toEqual(1);

		expect(newRaw.blocks[0].text).toEqual('a block with a entity');
		expect(newRaw.blocks[0].entityRanges.length).toEqual(1);
		expect(newRaw.blocks[0].entityRanges[0].offset).toEqual(15);
		expect(newRaw.blocks[0].entityRanges[0].length).toEqual(6);

		const key = newRaw.blocks[0].entityRanges[0].key;

		expect(newRaw.entityMap[key].data.href).toEqual('http://www.google.com');
	});

	test('Creates a link per block', () => {
		const {state, blockKeys} = getStateAndOffsetKeys({
			blocks: [
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'a block with a link',
					inlineStyleRanges: [],
					entityRanges: []
				},
				{
					type: BLOCKS.UNSTYLED,
					depth: 0,
					text: 'link in a block',
					inlineStyleRanges: [],
					entityRanges: []
				}
			],
			entityMap: {}
		});

		const selection = new SelectionState({
			anchorKey: blockKeys[0],
			anchorOffset: 15,
			focusKey: blockKeys[1],
			focusOffset: 4,
			isBackward: false,
			hasFocus: false
		});
		const entityKey = Entity.create(ENTITIES.LINK, MUTABILITY.MUTABLE, {href: ''});
		const linkState = RichUtils.toggleLink(state, selection, entityKey);

		const offsetKeys = getOffsetKeys(linkState);

		const newState = createNewLinkAtOffset('http://www.google.com', null, entityKey, offsetKeys[1], linkState);
		const newRaw = convertToRaw(newState.getCurrentContent());

		expect(Object.keys(newRaw.entityMap).length).toEqual(2);

		expect(newRaw.blocks[0].text).toEqual('a block with a link');
		expect(newRaw.blocks[0].entityRanges.length).toEqual(1);
		expect(newRaw.blocks[0].entityRanges[0].offset).toEqual(15);
		expect(newRaw.blocks[0].entityRanges[0].length).toEqual(4);

		let key =  newRaw.blocks[0].entityRanges[0].key;

		expect(newRaw.entityMap[key].data.href).toEqual('http://www.google.com');

		expect(newRaw.blocks[1].text).toEqual('link in a block');
		expect(newRaw.blocks[1].entityRanges.length).toEqual(1);
		expect(newRaw.blocks[1].entityRanges[0].offset).toEqual(0);
		expect(newRaw.blocks[1].entityRanges[0].length).toEqual(4);

		key = newRaw.blocks[1].entityRanges[0].key;

		expect(newRaw.entityMap[key].data.href).toEqual('http://www.google.com');
	});
});
