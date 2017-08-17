/* eslint-env jest */
import {EditorState, convertFromRaw} from 'draft-js';

import {BLOCKS} from '../../../../Constants';
import indexOfType from '../index-of-type';

function createEditorState (raw) {
	return EditorState.createWithContent(convertFromRaw(raw));
}

describe('indexOfType tests', () => {
	test ('Correctly gives the index of a block', () => {
		const protoBlock = {type: BLOCKS.UNSTYLED, depth: 0, text: '', inlineStyleRanges: [], entityRanges: []};
		const editorState = createEditorState({
			blocks: [
				{...protoBlock},
				{...protoBlock},
				{...protoBlock},
				{...protoBlock},
				{...protoBlock},
				{...protoBlock}
			],
			entityMap: {}
		});

		const blocks = editorState.getCurrentContent().getBlocksAsArray();

		for (let i = 0; i < blocks.length; i++) {
			expect(indexOfType(blocks[i], null, editorState)).toEqual(i);
		}
	});

	test ('Count skips blocks that aren\'t of type', () => {
		const protoUnstyled = {type: BLOCKS.UNSTYLED, depth: 0, text: '', inlineStyleRanges: [], entityRanges: []};
		const protoAtomic = {type: BLOCKS.ATOMIC, depth: 0, text: '', inlineStyleRanges: [], entityRanges: []};

		const isUnstyled = x => x.type === BLOCKS.UNSTYLED;
		const isAtomic = x => x.type === BLOCKS.ATOMIC;

		const editorState = createEditorState({
			blocks: [
				{...protoUnstyled},
				{...protoAtomic},
				{...protoUnstyled},
				{...protoAtomic},
				{...protoUnstyled},
				{...protoAtomic}
			],
			entityMap: {}
		});

		const blocks = editorState.getCurrentContent().getBlocksAsArray();

		const getUnstyledIndex = (i) => indexOfType(blocks[i], isUnstyled, editorState);
		const getAtomicIndex = (i) => indexOfType(blocks[i], isAtomic, editorState);

		expect(getUnstyledIndex(0)).toEqual(0);
		expect(getAtomicIndex(1)).toEqual(0);

		expect(getUnstyledIndex(2)).toEqual(1);
		expect(getAtomicIndex(3)).toEqual(1);

		expect(getUnstyledIndex(4)).toEqual(2);
		expect(getAtomicIndex(5)).toEqual(2);
	});
});
