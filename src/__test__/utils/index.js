import {EditorState, convertFromRaw, convertToRaw} from 'draft-js';

export getDefaultEditorState from './default-editor-state';

export function getEditorState (raw) {
	return raw ? EditorState.createWithContent(convertFromRaw(raw)) : EditorState.createEmpty();
}

export function getRawFromState (editorState) {
	return convertToRaw(editorState.getCurrentContent());
}

