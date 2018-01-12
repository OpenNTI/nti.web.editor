/* eslint-env jest */
import {EditorState, SelectionState, convertFromRaw} from 'draft-js';

import {HANDLED, NOT_HANDLED} from '../../Constants';
import {BLOCKS} from '../../../Constants';
import insertBlockPlugin from '../index';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

function isCodeBlock (block) {
	return block.getType() === BLOCKS.CODE;
}

function isAtomic (block) {
	return block.getType() === BLOCKS.ATOMIC;
}

describe('insertBlock plugin', () => {
	const plugin = insertBlockPlugin.create();

	const selection = new SelectionState({
		anchorKey: 'def',
		anchorOffset: 1,
		focusKey: 'def',
		focusOffset: 6
	});

	const editorState = createEditorState({
		blocks: [
			{key: 'abc', type: BLOCKS.CODE, depth: 0, text: 'block 1', inlineStyleRanges: [], entityRanges: []},
			{key: 'def', type: BLOCKS.UNSTYLED, depth: 0, text: 'block 2', inlineStyleRanges: [], entityRanges: []},
			{key: '123', type: BLOCKS.CODE, depth: 0, text: 'block 3', inlineStyleRanges: [], entityRanges: []},
			{key: '456', type: BLOCKS.ATOMIC, depth: 0, text: 'block 4', inlineStyleRanges: [], entityRanges: []}
		],
		entityMap: {}
	});

	let editorStateWithSelected = EditorState.forceSelection(editorState, selection);

	function getEditorState () {
		return editorStateWithSelected;
	}

	function setEditorState (newState) {
		editorStateWithSelected = newState;
	}

	const pluginContext = plugin.getContext(getEditorState, setEditorState, false);

	test('Test block count', () => {
		const numCodeBlocks = pluginContext.getInsertBlockCount(isCodeBlock);
		const numAtomicBlockds = pluginContext.getInsertBlockCount(isAtomic);

		expect(numCodeBlocks).toEqual(2);
		expect(numAtomicBlockds).toEqual(1);
	});

	test('Test get selected text', () => {
		const result = pluginContext.getSelectedTextForInsertion();

		expect(result[0]).toEqual('lock ');
	});

	test('Test handleDrop and handlers', () => {
		const id = 'someID';

		const dataTransfer = {
			data: {
				getData: function () {
					return id;
				}
			}
		};

		function handler () {}

		pluginContext.registerInsertHandler(id, handler);

		const handledResult = plugin.handleDrop(selection, dataTransfer);

		expect(handledResult).toEqual(HANDLED);

		pluginContext.unregisterInsertHandler(id);

		const unhandledResult = plugin.handleDrop(selection, dataTransfer);

		expect(unhandledResult).toEqual(NOT_HANDLED);

	});
});
