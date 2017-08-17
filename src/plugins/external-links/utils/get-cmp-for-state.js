import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';

function getBlockKeyToIndex (editorState) {
	const content = editorState.getCurrentContent();

	return content
		.getBlocksAsArray()
		.reduce((acc, block, index) => {
			acc[block.key] = index;

			return acc;
		}, {});
}


function getInfoForCmp (cmp) {
	return DraftOffsetKey.decode(cmp.offsetKey);
}

export default function getCmpForState (cmps, editorState) {
	const blockMap = getBlockKeyToIndex(editorState);
	const sorted = cmps.sort((a, b) => {
		a = getInfoForCmp(a);
		b = getInfoForCmp(b);

		const aBlockIndex = blockMap[a.blockKey];
		const bBlockIndex = blockMap[b.blockKey];

		const aDecorator = a.decoratorKey;
		const bDecorator = b.decoratorKey;

		const blockSort = aBlockIndex < bBlockIndex ? -1 : aBlockIndex === bBlockIndex ? 0 : 1;
		const decoratorSort = aDecorator < bDecorator ? -1 : aDecorator === bDecorator ? 0 : 1;

		return blockSort === 0 ? decoratorSort : blockSort;
	});

	return sorted[sorted.length - 1];
}
