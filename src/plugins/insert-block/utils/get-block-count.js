function getCount (blocks, predicate) {
	return blocks.filter(predicate).length;
}


function getGroupedCount (blocks, predicate) {
	let lastBlockMatched = false;
	let count = 0;

	for (let i = 0; i < blocks.length; i++) {
		let block = blocks[i];

		if (predicate(block, i, blocks)) {
			if (!lastBlockMatched) { count += 1; }

			lastBlockMatched = true;
		} else {
			lastBlockMatched = false;
		}
	}

	return count;
}

export default function getBlockCount (editorState, predicate, group) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	return group ? getGroupedCount(blocks, predicate) : getCount(blocks, predicate);
}
