import getSelectionForEntityKeyAtOffset from './get-selection-for-entity-key-at-offset';

export default function isEntityAtOffsetInSingleBlock (entityKey, offset, editorState) {
	const selection = getSelectionForEntityKeyAtOffset(entityKey, offset, editorState);

	return selection.getStartKey() === selection.getEndKey();
}
