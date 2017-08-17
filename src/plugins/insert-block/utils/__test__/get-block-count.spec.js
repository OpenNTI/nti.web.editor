/* eslint-env jest */
import {EditorState, convertFromRaw} from 'draft-js';


import {BLOCKS} from '../../../../Constants';
import getBlockCount from '../get-block-count';


function createState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

function isBlock (block) {
	return block.getType() === BLOCKS.HEADER_ONE;
}


function createTarget () {
	return {
		type: BLOCKS.HEADER_ONE,
		depth: 0,
		text: 'Target Block',
		inlineStyleRanges: [],
		entityRanges: []
	};
}

function createNonTarget () {
	return {
		type: BLOCKS.UNSTYLED,
		depth: 0,
		text: 'Non-target Block',
		inlineStyleRanges: [],
		entityRantes: []
	};
}


function getCount (blocks, group) {
	const state = createState({blocks, entityMap: {}});

	return getBlockCount(state, isBlock, group);
}

describe('getBlockCount', () => {
	describe('non-grouped', () => {
		test('no blocks', () => {
			const blocks = [createNonTarget(), createNonTarget(), createNonTarget()];

			expect(getCount(blocks)).toEqual(0);
		});

		test('target block at the start', () => {
			const blocks = [createTarget(), createNonTarget(), createNonTarget()];

			expect(getCount(blocks)).toEqual(1);
		});

		test('target block at the end', () => {
			const blocks = [createNonTarget(), createNonTarget(), createTarget()];

			expect(getCount(blocks)).toEqual(1);
		});

		test('target block in the middle', () => {
			const blocks = [createNonTarget(), createTarget(), createNonTarget()];

			expect(getCount(blocks)).toEqual(1);
		});

		test('Multiple target blocks', () => {
			const blocks = [createTarget(), createNonTarget(), createTarget()];

			expect(getCount(blocks)).toEqual(2);
		});


		test('All target blocks', () => {
			const blocks = [createTarget(), createTarget(), createTarget()];

			expect(getCount(blocks)).toEqual(3);
		});
	});

	describe('grouped', () => {
		test('no blocks', () => {
			const blocks = [createNonTarget(), createNonTarget(), createNonTarget(), createNonTarget(), createNonTarget()];

			expect(getCount(blocks, true)).toEqual(0);
		});

		test('groups length one', () => {
			const blocks = [createTarget(), createNonTarget(), createTarget(), createNonTarget(), createTarget()];

			expect(getCount(blocks, true)).toEqual(3);
		});

		test('groups length two', () => {
			const blocks = [createTarget(), createTarget(), createNonTarget(), createTarget(), createTarget()];

			expect(getCount(blocks, true)).toEqual(2);
		});

		test('groups of mixed length', () => {
			const blocks = [createTarget(), createTarget(), createTarget(), createNonTarget(), createTarget()];

			expect(getCount(blocks, true)).toEqual(2);
		});

		test('all target blocks', () => {
			const blocks = [createTarget(), createTarget(), createTarget(), createTarget(), createTarget()];

			expect(getCount(blocks, true)).toEqual(1);
		});
	});
});
