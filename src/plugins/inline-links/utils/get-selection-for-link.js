import {SelectionState} from 'draft-js';

export default function getSelectionForLink (link, block) {
	const key = block.getKey();

	return new SelectionState({
		anchorKey: key,
		anchorOffset: link.index,
		focusKey: key,
		focusOffset: link.lastIndex
	});
}
