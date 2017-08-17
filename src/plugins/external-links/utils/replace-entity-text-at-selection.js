import {Modifier, EditorState, SelectionState} from 'draft-js';

export function getNewSelection (text, selection) {
	const anchorOffset = selection.getAnchorOffset();

	return new SelectionState({
		anchorKey: selection.getAnchorKey(),
		anchorOffset,
		focusKey: selection.getFocusKey(),
		focusOffset: anchorOffset + text.length,
		isBackward: false,
		hasFocus: selection.getHasFocus()
	});
}

export default function replaceEntityTextAtOffset (text, entityKey, selection, editorState) {
	const content = editorState.getCurrentContent();
	const newContent = Modifier.replaceText(content, selection, text, void 0, entityKey);
	const newSelection = getNewSelection(text, selection);

	return EditorState.create({
		currentContent: newContent,
		allowUndo: editorState.getAllowUndo(),
		decorator: editorState.getDecorator(),
		selection: newSelection
	});
}
