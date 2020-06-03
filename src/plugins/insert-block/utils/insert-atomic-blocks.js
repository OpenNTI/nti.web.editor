import {EditorState, AtomicBlockUtils} from 'draft-js';

import {MUTABILITY, CHANGE_TYPES} from '../../../Constants';

export default function insertAtomicBlock (data, selection, editorState) {
	if (!Array.isArray(data)) { data = [data]; }

	let newContent = editorState.getCurrentContent();
	let newSelection = selection || editorState.getSelection();
	let newEditorState = EditorState.create({
		currentContent: newContent,
		selection: newSelection
	});

	for (let datum of data) {
		newContent = newContent.createEntity(datum.MimeType || 'unknown', MUTABILITY.IMMUTABLE, datum);
		const entityKey = newContent.getLastCreatedEntityKey();

		newEditorState = AtomicBlockUtils.insertAtomicBlock(
			EditorState.set(newEditorState, {currentContent: newContent, selection: newSelection}),
			entityKey,
			' '
		);

		newContent = newEditorState.getCurrentContent();
		newSelection = newEditorState.getSelection();
	}

	return EditorState.push(editorState, newContent, CHANGE_TYPES.INSERT_FRAGMENT);
}