import getSelectionForEntityKeyAtOffset from './get-selection-for-entity-key-at-offset';
import replaceEntityTextAtSelection from './replace-entity-text-at-selection';

export default function replaceEntityTextAtOffset (text, entityKey, offset, editorState) {
	const selection = getSelectionForEntityKeyAtOffset(entityKey, offset, editorState);

	return replaceEntityTextAtSelection(text, entityKey, selection, editorState);
}
