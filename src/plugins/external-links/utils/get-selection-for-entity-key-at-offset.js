import {SelectionState} from 'draft-js';
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';
import getRangesForDraftEntity from 'draft-js/lib/getRangesForDraftEntity';


function findRangeForBlock (block, entityKey, predicate) {
	try {
		const ranges = getRangesForDraftEntity(block, entityKey);

		for (let range of ranges) {
			if (predicate(range)) {
				return range;
			}
		}
	} catch (e) {
		return null;
	}

}


function getStartOfSelection (range, block, entityKey, content) {
	const start = {key: block.key, offset: range.start};

	if (range.start !== 0) {
		return start;
	}

	const prevBlock = content.getBlockBefore(block.key);
	const prevRange = prevBlock && findRangeForBlock(prevBlock, entityKey, r => r.end === prevBlock.text.length);

	if (prevRange) {
		return getStartOfSelection(prevRange, prevBlock, entityKey, content);
	}

	return start;
}


function getEndOfSelection (range, block, entityKey, content) {
	const end = {key: block.key, offset: range.end};

	if (range.end !== block.text.length) {
		return end;
	}

	const nextBlock = content.getBlockAfter(block.key);
	const nextRange = nextBlock && findRangeForBlock(nextBlock, entityKey, r => r.start === 0);

	if (nextRange) {
		return getEndOfSelection(nextRange, nextBlock, entityKey, content);
	}

	return end;
}


function getInfoForOffsetKey (offsetKey, editorState) {
	const {blockKey, decoratorKey, leafKey} = DraftOffsetKey.decode(offsetKey);
	const {start, end} = editorState
		.getBlockTree(blockKey)
		.getIn([decoratorKey, 'leaves', leafKey]);

	return {
		blockKey,
		range: {start, end}
	};
}


export default function getSelectionForEntityKeyAtOffset (entityKey, offsetKey, editorState) {
	const {blockKey, range} = getInfoForOffsetKey(offsetKey, editorState);
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const block = content.getBlockForKey(blockKey);

	const start = getStartOfSelection(range, block, entityKey, content);
	const end = getEndOfSelection(range, block, entityKey, content);

	return new SelectionState({
		anchorKey: start.key,
		anchorOffset: start.offset,
		focusKey: end.key,
		focusOffset: end.offset,
		isBackward: false,
		hasFocus: selection.getHasFocus()
	});
}
