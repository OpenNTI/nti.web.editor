export default function generateChecksFor(around, between) {
	const isFocusable = block =>
		!around.has(block.type) && !between.has(block.type);

	//Should Insert Around if the block type is different from prev and prev is not focusable
	const shouldInsertAround = (block, prev) => {
		return (
			around.has(block.type) &&
			block.type !== prev.type &&
			!isFocusable(prev)
		);
	};
	//Should insert between if the prev block is not focusable
	const shouldInsertBetween = (block, prev) => {
		return between.has(block.type) && !isFocusable(prev);
	};
	//should insert before if the first block is not focusable
	const shouldInsertBefore = (block, prev) => {
		return (
			(!prev && !isFocusable(block)) ||
			shouldInsertAround(block, prev) ||
			shouldInsertBetween(block, prev)
		);
	};

	return {
		isFocusable,
		shouldInsertBefore,
		shouldInsertAround,
		shouldInsertBetween,
	};
}
