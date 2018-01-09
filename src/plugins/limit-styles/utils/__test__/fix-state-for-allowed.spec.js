/* eslint-env jest */

import { getEditorState } from '../../../../__test__/utils';
import { BLOCKS, STYLES, STYLE_SET } from '../../../../Constants';
import fixStateForAllowed from '../fix-state-for-allowed';

describe('fix state for allowed styles', () => {
	test('should keep styles the same for the block', () => {
		const editorState = getEditorState({
			entityMap: {},
			blocks: [
				{
					'text': 'test',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 4,
							'style': 'BOLD'
						}
					],
					'entityRanges': [],
					'data': {}
				}
			]
		});
		const allowed = STYLE_SET;
		const byBlockType = {
			[BLOCKS.UNSTYLED]: new Set([STYLES.BOLD])
		};

		const fixedState = fixStateForAllowed(editorState, allowed, byBlockType);
		const currentContent = fixedState.getCurrentContent();
		const block = currentContent.getFirstBlock();
		const inlineStyle = block.getInlineStyleAt(0);

		expect(inlineStyle.has(STYLES.BOLD)).toBeTruthy();
	});

	test('should remove bold from block', () => {
		const editorState = getEditorState({
			entityMap: {},
			blocks: [
				{
					'text': 'test',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 4,
							'style': 'BOLD'
						}
					],
					'entityRanges': [],
					'data': {}
				}
			]
		});
		const allowed = new Set([
			STYLES.CODE,
			STYLES.ITALIC,
			STYLES.STRIKETHROUGH,
			STYLES.UNDERLINE
		]);
		const byBlockType = {
			[BLOCKS.UNSTYLED]: new Set()
		};

		const fixedState = fixStateForAllowed(editorState, allowed, byBlockType);
		const currentContent = fixedState.getCurrentContent();
		const block = currentContent.getFirstBlock();
		const inlineStyle = block.getInlineStyleAt(0);

		expect(inlineStyle.has(STYLES.BOLD)).toBeFalsy();
	});
});