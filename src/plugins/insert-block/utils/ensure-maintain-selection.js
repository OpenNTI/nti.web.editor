import {EditorState} from 'draft-js';

/**
 * Some browsers (COUGHfirefoxCOUGH) don't automatically show the selection, so
 * for block types that need to maintain selection (not move up a block), this
 * function will ensure that the selection is maintained and actually selected
 *
 * @param  {EditorState} editorState State of the editor after block insertion
 * @return {EditorState}             State of the editor after selection updated
 */
export default function ensureMaintainSelection (editorState) {
	const selectionState = editorState.getSelection && editorState.getSelection();
	const contentState = editorState.getCurrentContent && editorState.getCurrentContent();
	const currBlock = contentState && contentState.getBlockForKey(selectionState.focusKey);

	if (editorState && contentState) {
		let newEditorState;

		if (currBlock) {
			const newSelectionState = selectionState.merge({
				anchorKey: currBlock.getKey(),
				focusKey: currBlock.getKey()
			});

			newEditorState = EditorState.acceptSelection(editorState, newSelectionState);
		}

		return newEditorState;
	}

	return editorState;
}
