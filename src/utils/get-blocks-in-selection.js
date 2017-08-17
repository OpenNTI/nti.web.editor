export default function getBlocksInSelection (content, selection) {
	const startKey = selection.getStartKey();
	const endKey = selection.getEndKey();

	let ended = false;

	return content.getBlockMap()
		.skipUntil(block => block.getKey() === startKey)
		.takeUntil(block => {
			const result = ended;

			if (block.getKey() === endKey) {
				ended = true;
			}

			return result;
		})
		.toArray();
}
