export default function isSameState(a, b) {
	const selectionA = a.getSelection();
	const selectionB = b.getSelection();
	const contentA = a.getCurrentContent();
	const contentB = b.getCurrentContent();

	if (
		selectionA.getFocusKey() !== selectionB.getFocusKey() ||
		selectionA.getFocusOffset() !== selectionB.getFocusOffset() ||
		selectionA.getAnchorKey() !== selectionB.getAnchorKey() ||
		selectionA.getAnchorOffset() !== selectionB.getAnchorOffset()
	) {
		return false;
	}

	const blockA = contentA.getBlockForKey(selectionA.getFocusKey());
	const blockB = contentB.getBlockForKey(selectionB.getFocusKey());

	return blockA.getText() === blockB.getText();
}
