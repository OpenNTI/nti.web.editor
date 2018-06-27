function getCount (blocks, predicate, getNested) {
	let count = 0;

	for (let i = 0; i < blocks.length; i++) {
		let block = blocks[i];
		let nested = getNested && getNested(block);

		if (predicate(block, i, blocks)) {
			count += 1;
		}

		if (nested) {
			count += getCount(nested, predicate, getNested);
		}
	}

	return count;
}


function getGroupedCount (blocks, predicate, getNested) {
	let lastBlockMatched = false;
	let count = 0;

	for (let i = 0; i < blocks.length; i++) {
		let block = blocks[i];
		let nested = getNested && getNested(block);

		if (predicate(block, i, blocks)) {
			if (!lastBlockMatched) { count += 1; }

			lastBlockMatched = true;
		} else {
			lastBlockMatched = false;
		}

		if (nested) {
			count += getGroupedCount(nested, predicate, getNested);
		}
	}

	return count;
}

export default function getBlockCount (editorState, predicate, group, getNestedState) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	function getNestedBlocks (block) {
		if (!getNestedState) { return null; }

		const state = getNestedState(block);

		if (!state) { return null; }

		const content = state.getCurrentContent ? state.getCurrentContent() : state;

		return content.getBlocksAsArray();
	}

	return group ? getGroupedCount(blocks, predicate, getNestedBlocks) : getCount(blocks, predicate, getNestedBlocks);
}
