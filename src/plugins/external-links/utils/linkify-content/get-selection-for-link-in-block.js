import {SelectionState} from 'draft-js';

export default function getSelectionForLinkInBlock (block, link, startOffset) {
	const endOffset = startOffset + link.lastIndex;

	return new SelectionState({
		anchorKey: block.getKey(),
		anchorOffset: startOffset,
		focusKey: block.getKey(),
		focusOffset: endOffset
	});
}
