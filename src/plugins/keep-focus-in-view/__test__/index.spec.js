/* eslint-env jest */
import { EditorState, SelectionState, convertFromRaw } from 'draft-js';

import { BLOCKS } from '../../../Constants';
import keepFocusInView from '../index';

function createEditorState(raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

let scrollToX;
let scrollToY;

const onBefore = () => {
	scrollToX = 0;
	scrollToY = 0;

	global.getSelection = function () {
		return {
			rangeCount: 1,
			getRangeAt: function () {
				return {
					getClientRects: function () {
						return [
							{
								top: 10,
								right: 50,
								bottom: 30,
								left: 20,
								width: 30,
								height: 20,
							},
						];
					},
				};
			},
		};
	};

	global.pageYOffset = 500;
	global.pageXOffset = 400;

	global.scrollTo = function (x, y) {
		scrollToX = x;
		scrollToY = y;
	};
};

const onAfter = () => {
	scrollToX = 0;
	scrollToY = 0;

	delete global.getSelection;
	delete global.pageYOffset;
	delete global.pageXOffset;
	delete global.scrollTo;
};

describe('keepFocusInView plugin', () => {
	beforeEach(onBefore);
	afterEach(onAfter);

	const plugin = keepFocusInView.create();

	const selection = new SelectionState({
		anchorKey: 'def',
		anchorOffset: 1,
		focusKey: 'def',
		focusOffset: 6,
	});

	const editorState = createEditorState({
		blocks: [
			{
				key: 'abc',
				type: BLOCKS.CODE,
				depth: 0,
				text: 'block 1',
				inlineStyleRanges: [],
				entityRanges: [],
			},
			{
				key: 'def',
				type: BLOCKS.UNSTYLED,
				depth: 0,
				text: 'block 2',
				inlineStyleRanges: [],
				entityRanges: [],
			},
			{
				key: '123',
				type: BLOCKS.CODE,
				depth: 0,
				text: 'block 3',
				inlineStyleRanges: [],
				entityRanges: [],
			},
			{
				key: '456',
				type: BLOCKS.ATOMIC,
				depth: 0,
				text: 'block 4',
				inlineStyleRanges: [],
				entityRanges: [],
			},
		],
		entityMap: {},
	});

	let editorStateWithSelected = EditorState.forceSelection(
		editorState,
		selection
	);

	test('Test onChange sets correct scroll position', () => {
		plugin.onChange(editorStateWithSelected);

		expect(scrollToX).toEqual(400);
		expect(scrollToY).toEqual(430);
	});
});
