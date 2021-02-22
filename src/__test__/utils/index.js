import {
	EditorState,
	convertFromRaw,
	convertToRaw,
	SelectionState,
} from 'draft-js';

export { default as getDefaultEditorState } from './default-editor-state';

export function getEditorState(raw) {
	return raw
		? EditorState.createWithContent(convertFromRaw(raw))
		: EditorState.createEmpty();
}

export function getRawFromState(editorState) {
	return convertToRaw(editorState.getCurrentContent());
}

export function getNewStateFromSelection(editorState, selection) {
	return EditorState.acceptSelection(
		editorState,
		new SelectionState(selection)
	);
}
