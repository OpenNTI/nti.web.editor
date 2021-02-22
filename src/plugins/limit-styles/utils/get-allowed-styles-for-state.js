export default function getAlllowedStylesForState(
	editorState,
	allowed,
	byBlockType
) {
	const selection = editorState.getSelection();
	const anchorKey = selection.getAnchorKey();
	const focusKey = selection.getFocusKey();

	//if we spread more than one block for now just assume we want to use the global allowed
	if (anchorKey !== focusKey) {
		return allowed;
	}

	const content = editorState.getCurrentContent();
	const block = content.getBlockForKey(anchorKey);

	return byBlockType[block.getType()] || allowed;
}
