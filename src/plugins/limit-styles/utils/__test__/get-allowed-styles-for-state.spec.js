/* eslint-env jest */

import { getEditorState, getNewStateFromSelection } from '../../../../__test__/utils';
import { BLOCKS, STYLES, STYLE_SET } from '../../../../Constants';
import getAlllowedStylesForState from '../get-allowed-styles-for-state';

describe('get allowed styles for state', () => {
	test('should give all allowed styles', () => {
		const editorState = getEditorState({
			'entityMap': {},
			'blocks': [
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
				},
				{
					'text': 'test',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 4,
							'style': 'UNDERLINE'
						}
					],
					'entityRanges': [],
					'data': {}
				},
				{
					'text': 'header',
					'type': 'header-one',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 6,
							'style': 'ITALIC'
						}
					],
					'entityRanges': [],
					'data': {}
				}
			]
		});
		const allowed = STYLE_SET;
		const byBlockType = {};
		const allowedStyles = getAlllowedStylesForState(editorState, allowed, byBlockType);

		expect(allowedStyles).toEqual(STYLE_SET);
	});

	test('should give back block allowed styles', () => {
		const editorState = getEditorState({
			'entityMap': {},
			'blocks': [
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
				},
				{
					'text': 'test',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 4,
							'style': 'UNDERLINE'
						}
					],
					'entityRanges': [],
					'data': {}
				},
				{
					'text': 'header',
					'type': 'header-one',
					'depth': 0,
					'inlineStyleRanges': [
						{
							'offset': 0,
							'length': 6,
							'style': 'ITALIC'
						}
					],
					'entityRanges': [],
					'data': {}
				}
			]
		});
		const currrentContent = editorState.getCurrentContent();
		const currentBlock = currrentContent.getFirstBlock();
		const currentBlockKey = currentBlock.getKey();
		const selection = {
			focusKey: currentBlockKey,
			anchorKey: currentBlockKey,
			anchorOffset: 4,
			focusOffset: 0,
			isBackward: true,
			hasFocus: true
		};
		const editorStateWithSelection = getNewStateFromSelection(editorState, selection);
		const allowed = STYLE_SET;
		const unstyledStyles = new Set([STYLES.BOLD, STYLES.ITALIC]);
		const byBlockType = {
			[BLOCKS.UNSTYLED]: unstyledStyles
		};

		const allowedStyles = getAlllowedStylesForState(editorStateWithSelection, allowed, byBlockType);
		expect(allowedStyles).toEqual(unstyledStyles);	
	});
});