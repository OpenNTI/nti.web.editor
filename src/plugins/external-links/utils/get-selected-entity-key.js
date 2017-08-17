function getStartAndEnd (selection) {
	const start = selection.getStartOffset();
	const end = selection.getEndOffset();

	return {start, end: end - 1};
}


function getCollapsedSelectedEntityKey (selection, currentBlock) {
	const start = selection.getStartOffset();

	return currentBlock.getEntityAt(start) || currentBlock.getEntityAt(start - 1);
}


function getExpandedSelectionEntityKey (selection, currentBlock) {
	const {start, end} = getStartAndEnd(selection);

	let entityKey = void 0;

	for (let i = start; i <= end; i++) {
		let currentEntity = currentBlock.getEntityAt(i);

		//if a character is selected that doesn't have an entity return no entity
		if (!currentEntity) {
			entityKey = void 0;
			break;
		}

		//if we just started set the entity as the current one
		if (i === start) {
			entityKey = currentEntity;
		//if we get an entity thats different from the other characters, there is more than one
		//so say there is no selected entity
		} else if (entityKey !== currentEntity) {
			entityKey = void 0;
			break;
		}
	}

	return entityKey;
}

export default function getSelectedEntityKey (editorState) {
	const selection = editorState.getSelection();

	if (!selection.getHasFocus() || selection.getStartKey() !== selection.getEndKey()) { return void 0; }

	const content = editorState.getCurrentContent();
	const currentBlock = content.getBlockForKey(selection.getStartKey());

	return selection.isCollapsed() ?
		getCollapsedSelectedEntityKey(selection, currentBlock) :
		getExpandedSelectionEntityKey(selection, currentBlock);
}
