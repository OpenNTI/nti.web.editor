import {SelectionState} from 'draft-js';

export default function (block) {
	const key = block.getKey();

	return new SelectionState({
		anchorKey: key,
		anchorOffset: 0,
		focusKey: key,
		focusOffset: block.getLength()
	});
}
