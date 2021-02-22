function getCollapsedSelectedEntityKey(selection, currentBlock) {
	const start = selection.getStartOffset();

	return (
		currentBlock.getEntityAt(start) || currentBlock.getEntityAt(start - 1)
	);
}

function getExpandedSelectedEntityKey(selection, currentBlock) {
	const start = selection.getStartOffset();
	const end = selection.getEndOffset() - 1;

	let entityKey = void 0;

	for (let i = start; i <= end; i++) {
		let currentEntity = currentBlock.getEntityAt(i);

		//if a character is selected that doesn't have an entity return no entity
		if (!currentEntity) {
			entityKey = void 0;
			break;
		}

		//If we just started set the entity as the current one
		if (i === start) {
			entityKey = currentEntity;
			//If we can an entity thats different from the other characters, there is more than one
			//so say there is no selected entity
		} else if (entityKey !== currentEntity) {
			entityKey = void 0;
			break;
		}
	}

	return entityKey;
}

export default function getSelectedEntityKey(editorState) {
	const selection = editorState.getSelection();

	if (
		!selection.getHasFocus() ||
		selection.getStartKey() !== selection.getEndKey()
	) {
		return void 0;
	}

	const content = editorState.getCurrentContent();
	const currentBlock = content.getBlockForKey(selection.getStartKey());

	return selection.isCollapsed()
		? getCollapsedSelectedEntityKey(selection, currentBlock)
		: getExpandedSelectedEntityKey(selection, currentBlock);
}
