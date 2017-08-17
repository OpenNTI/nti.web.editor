function validBlock (block, allowedSet) {
	return block && allowedSet.has(block.getType());
}

function containsOnlyAllowedTypes (selection, content, allowedSet) {
	const startKey = selection.getStartKey();
	const endKey = selection.getEndKey();

	let block = content.getBlockForKey(startKey);

	if (!validBlock(block, allowedSet)) { return false; }

	if (startKey === endKey) { return true; }

	block = content.getBlockAfter(startKey);

	while (block.key !== endKey) {
		if (!validBlock(block, allowedSet)) { return false; }

		block = content.getBlockAfter(block.key);
	}

	block = content.getBlockForKey(endKey);

	if (!validBlock(block, allowedSet)) { return false; }

	return true;
}

export default function isValidSelectionForLink (editorState, allowedSet) {
	const selection = editorState.getSelection();

	//If there is no selection or its collapsed its not
	//a valid selection for a link
	if (!selection || selection.isCollapsed()) { return false; }

	return allowedSet ? containsOnlyAllowedTypes(selection, editorState.getCurrentContent(), allowedSet) : true;
}
