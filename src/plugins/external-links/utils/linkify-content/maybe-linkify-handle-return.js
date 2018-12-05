import {EditorState, Modifier} from 'draft-js';

import {CHANGE_TYPES} from '../../../../Constants';

import getLinkBeforeSelection from './get-link-before-selection';
import isSameState from './is-same-state';
import applyLinkToContent from './apply-link-to-content';
import removeLinkFromContent from './remove-link-from-content';

export default function maybeLinkifyHandleReturn (editorState) {
	const link = getLinkBeforeSelection(editorState);

	if (!link) { return null; }

	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	let newContent = Modifier.splitBlock(content, selection);
	let newEditorState = EditorState.push(editorState, newContent, CHANGE_TYPES.SPLIT_BLOCK);
	const splitEditorState = newEditorState;

	newContent = applyLinkToContent(link, newContent);
	newEditorState = EditorState.push(newEditorState, newContent, CHANGE_TYPES.APPLY_ENTITY);

	newEditorState = EditorState.forceSelection(newEditorState, splitEditorState.getSelection());

	return {
		editorState: newEditorState,
		undo: (undoEditorState) => {
			if (!isSameState(undoEditorState, newEditorState)) { return; }

			const undoneEditorState = EditorState.push(
				undoEditorState,
				removeLinkFromContent(link, undoEditorState.getCurrentContent()),
				CHANGE_TYPES.APPLY_ENTITY
			);

			return EditorState.forceSelection(undoneEditorState, undoEditorState.getSelection());
		}
	};
}
