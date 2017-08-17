import {SelectionState} from 'draft-js';

export default function fixSelection (content, selection/*, willRemove*/) {
	if (selection.isCollapsed()) { return selection; }

	const focusKey = selection.getFocusKey();
	const focusOffset = selection.getFocusOffset();

	return new SelectionState({
		anchorKey: focusKey,
		anchorOffset: focusOffset,
		focusKey,
		focusOffset
	});
}
