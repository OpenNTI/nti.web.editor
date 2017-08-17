import {getBlocksInSelection} from '../../../utils';

export default function getSelectedText (editorState) {
	const selection = editorState.getSelection();

	if (selection.isCollapsed()) { return null; }

	const startKey = selection.getStartKey();
	const endKey = selection.getEndKey();

	return getBlocksInSelection(editorState.getCurrentContent(), selection)
		.map(block => {
			const key = block.getKey();
			const text = block.getText();

			let start = 0;
			let end = text.length;

			if (key === startKey) {
				start = selection.getStartOffset();
			}

			if (key === endKey) {
				end = selection.getEndOffset();
			}

			return text.slice(start, end);
		});
}
