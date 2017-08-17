/* eslint-env jest */
import {BLOCKS, ENTITIES, MUTABILITY} from '../../../../Constants';
import getSelectionForEntityKeyAtOffset from '../get-selection-for-entity-key-at-offset';

import {getStateAndOffsetKeys} from './utils';


describe('get-selection-for-entity-key-at-offset', () => {
	describe('Single Entity Range', () => {
		test('Start of block', () => {
			const {state, offsetKeys, blockKeys} = getStateAndOffsetKeys({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'link and then some',
						inlineStyleRanges: [],
						entityRanges: [{offset: 0, length: 4, key: 0}]
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

			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[0], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(0);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(4);
		});

		test('Middle of block', () => {
			const {state, offsetKeys, blockKeys} = getStateAndOffsetKeys({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'Some text and a link and then some',
						inlineStyleRanges: [],
						entityRanges: [{offset: 16, length: 4, key: 0}]
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

			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[0], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(16);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(20);
		});

		test('End of block', () => {
			const {state, offsetKeys, blockKeys} = getStateAndOffsetKeys({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'Some text and a link',
						inlineStyleRanges: [],
						entityRanges: [{offset: 16, length: 4, key: 0}]
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

			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[0], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(16);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(20);
		});
	});

	describe('Single Entity, Multiple Non-consecutive Entity Ranges', () => {
		let state = null;
		let offsetKeys = null;
		let blockKeys = null;

		beforeEach(() => {
			const {state:s, offsetKeys:o, blockKeys:b} = getStateAndOffsetKeys({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'Some text and a link. Then some more text and another link. And one more link for good measure',
						inlineStyleRanges: [],
						entityRanges: [
							{offset: 16, length: 4, key: 0},
							{offset: 54, length: 5, key: 0},
							{offset: 73, length: 4, key: 0}
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

			state = s;
			offsetKeys = o;
			blockKeys = b;
		});

		test('Selection for first entity range', () => {
			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[0], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(16);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(20);
		});


		test('Selection for second entity range', () => {
			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[1], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(54);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(59);
		});

		test('Selection for third entity range', () => {
			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[2], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(73);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(77);
		});
	});


	describe('Single Entity, Multiple Consecutive Entity Ranges', () => {
		let state = null;
		let offsetKeys = null;
		let blockKeys = null;

		beforeEach(() => {
			const {state:s, offsetKeys:o, blockKeys:b} = getStateAndOffsetKeys({
				blocks: [
					{
						type: BLOCKS.UNSTYLED,
						depth: 0,
						text: 'This has a link that is more than one range',
						inlineStyleRanges: [],
						entityRanges: [
							{offset: 11, length: 10, key: 0},
							{offset: 21, length: 12, key: 0},
							{offset: 33, length: 10, key: 0}
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

			state = s;
			offsetKeys = o;
			blockKeys = b;
		});

		test('Fist Range', () => {
			const selection = getSelectionForEntityKeyAtOffset(0, offsetKeys[0], state);

			expect(selection.getStartKey()).toEqual(blockKeys[0]);
			expect(selection.getStartOffset()).toEqual(11);

			expect(selection.getEndKey()).toEqual(blockKeys[0]);
			expect(selection.getEndOffset()).toEqual(43);
		});

		test('Draft collapses the ranges into one', () => {
			expect(offsetKeys.length).toEqual(1);
		});
	});
});
