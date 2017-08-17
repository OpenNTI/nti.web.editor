import {EditorState, SelectionState, Modifier} from 'draft-js';

/**
 * Move selection to the next block.  Useful for some block types like videos
 * or images, where we want the selection on the next line after insert
 *
 * @param  {EditorState} editorState State of the editor after block insertion
 * @return {EditorState}             State of the editor after selection updated
 */
export default function moveSelectionToNextBlock (editorState) {
	const selectionState = editorState.getSelection && editorState.getSelection();
	const contentState = editorState.getCurrentContent && editorState.getCurrentContent();
	const nextBlock = contentState && contentState.getBlockAfter(selectionState.focusKey);

	if (editorState && contentState) {
		let newEditorState;

		if (nextBlock) {
			newEditorState = EditorState.acceptSelection(editorState, SelectionState.createEmpty(nextBlock.getKey()));
		} else {
			const newContent = Modifier.insertText(contentState, selectionState, '\n', editorState.getCurrentInlineStyle(), null);
			const tmpEditorState = EditorState.push(editorState, newContent, 'insert-characters');
			newEditorState = EditorState.acceptSelection(tmpEditorState, SelectionState.createEmpty(newContent.getLastBlock().getKey()));
		}

		return newEditorState;
	}

	return editorState;
}
