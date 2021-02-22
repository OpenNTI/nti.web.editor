function getFirstEntityKey(content, selection) {
	const startBlock = selection.getStartKey();
	const endBlock = selection.getEndKey();

	if (startBlock !== endBlock) {
		return null;
	}

	const block = content.getBlockForKey(startBlock);
	const start = selection.getStartOffset() || 0;
	const end = selection.getEndOffset() || block.getText().length;

	for (let i = start; i <= end; i++) {
		let entity = block.getEntityAt(i);

		if (entity) {
			return entity;
		}
	}
}

export default function getHrefForSelection(editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const entityKey = getFirstEntityKey(content, selection);
	const entity = entityKey && content.getEntity(entityKey);

	return entity ? entity.getData().href : null;
}
