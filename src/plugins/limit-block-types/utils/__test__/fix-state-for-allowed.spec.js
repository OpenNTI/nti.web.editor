/* eslint-env jest */
import { getDefaultEditorState, getRawFromState, getEditorState } from '../../../../__test__/utils';
import { BLOCKS } from '../../../../Constants';
import fixStateForAllowed from '../fix-state-for-allowed';

describe('Fix state for allowed ', () => {
	test('all blocks are unstyled', () => {
		const includeTypes = [BLOCKS.UNSTYLED, BLOCKS.CODE];
		const editorState = getDefaultEditorState(includeTypes);
		const allowed = new Set([BLOCKS.UNSTYLED]);

		const fixedState = fixStateForAllowed(editorState, allowed);
		const fixedRaw = getRawFromState(fixedState);

		fixedRaw.blocks.forEach(block => {
			expect(block.type).toBe(BLOCKS.UNSTYLED);
		});
	});
	test('all blocks are unstyled or block', () => {
		const editorState = getEditorState({
			blocks: [
				{ text: 'paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'code', type: 'code-block', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'quote', type: 'blockquote', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {}
		});
		const allowed = new Set([BLOCKS.UNSTYLED, BLOCKS.BLOCKQUOTE]);

		const fixedState = fixStateForAllowed(editorState, allowed);
		const fixedRaw = getRawFromState(fixedState);
		const { blocks } = fixedRaw;

		expect(blocks[0].type).toBe(BLOCKS.UNSTYLED);
		expect(blocks[1].type).toBe(BLOCKS.UNSTYLED);
		expect(blocks[2].type).toBe(BLOCKS.BLOCKQUOTE);
	});
});