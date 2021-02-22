/* eslint-env jest */

import getCurrentBlockType from '../get-current-block-type';
import { BLOCKS } from '../../../../Constants';
import {
	getEditorState,
	getNewStateFromSelection,
} from '../../../../__test__/utils';

describe('get current block type', () => {
	test('should return first block type', () => {
		const editorState = getEditorState({
			entityMap: {},
			blocks: [
				{
					text: 'test',
					type: 'unordered-list-item',
					depth: 0,
					inlineStyleRanges: [
						{
							offset: 0,
							length: 4,
							style: 'BOLD',
						},
					],
					entityRanges: [],
					data: {},
				},
			],
		});
		const blockType = getCurrentBlockType(editorState);
		expect(blockType).toBe(BLOCKS.UNORDERED_LIST_ITEM);
	});

	test('should return correct block type for selected', () => {
		const editorState = getEditorState({
			entityMap: {},
			blocks: [
				{
					text: 'test',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [
						{
							offset: 0,
							length: 4,
							style: 'BOLD',
						},
					],
					entityRanges: [],
					data: {},
				},
				{
					text: 'test',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [
						{
							offset: 0,
							length: 4,
							style: 'UNDERLINE',
						},
					],
					entityRanges: [],
					data: {},
				},
				{
					key: '2nl44',
					text: 'header',
					type: 'header-one',
					depth: 0,
					inlineStyleRanges: [
						{
							offset: 0,
							length: 6,
							style: 'ITALIC',
						},
					],
					entityRanges: [],
					data: {},
				},
			],
		});
		const selection = {
			anchorKey: '2nl44',
			anchorOffset: 6,
			focusKey: '2nl44',
			focusOffset: 0,
			isBackward: true,
			hasFocus: false,
		};
		const editorStateWithSelection = getNewStateFromSelection(
			editorState,
			selection
		);
		const blockType = getCurrentBlockType(editorStateWithSelection);
		expect(blockType).toBe(BLOCKS.HEADER_ONE);
	});
});
