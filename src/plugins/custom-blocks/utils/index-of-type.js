export default function indexOfType (contentBlock, isOfType, editorState) {
	const blocks = editorState.getCurrentContent().getBlocksAsArray();
	let count = 0;

	for (let block of blocks) {
		if (block === contentBlock) {
			break;
		}

		if (!isOfType || isOfType(block)) {
			count += 1;
		}
	}

	return count;
}
