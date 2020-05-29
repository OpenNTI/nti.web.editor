export default function getCurrentBlockType (editorState) {
	if (!editorState) { return ''; }

	const selection = editorState.getSelection();
	const content = editorState.getCurrentContent();
	const start = selection.getStartKey();
	const end = selection.getEndKey();
	const block = content.getBlockForKey(start);

	return start === end && block ? block.getType() : '';
}
