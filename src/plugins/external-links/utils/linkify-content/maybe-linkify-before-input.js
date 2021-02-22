import { EditorState, Modifier, SelectionState } from 'draft-js';

import { CHANGE_TYPES } from '../../../../Constants';

import getLinkBeforeSelection from './get-link-before-selection';
import isSameState from './is-same-state';
import applyLinkToContent from './apply-link-to-content';
import removeLinkFromContent from './remove-link-from-content';

function endsInSpace(chars) {
	const last = chars.charAt(chars.length - 1);

	return last === ' ';
}

export default function maybeLinkifyBeforeInput(
	chars,
	editorState,
	allowedInBlockTypes
) {
	if (!endsInSpace(chars)) {
		return null;
	}

	const link = getLinkBeforeSelection(editorState, allowedInBlockTypes);

	if (!link) {
		return null;
	}

	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	let newContent = Modifier.insertText(
		content,
		selection,
		chars,
		editorState.getCurrentInlineStyle(),
		null
	);
	let newEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.INSERT_CHARACTERS
	);

	newContent = applyLinkToContent(link, newContent);
	newEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.APPLY_ENTITY
	);

	newEditorState = EditorState.forceSelection(
		newEditorState,
		new SelectionState({
			focusKey: selection.getFocusKey(),
			focusOffset: selection.getFocusOffset() + chars.length,
			anchorKey: selection.getAnchorKey(),
			anchorOffset: selection.getAnchorOffset() + chars.length,
		})
	);

	return {
		editorState: newEditorState,
		undo: undoEditorState => {
			if (!isSameState(undoEditorState, newEditorState)) {
				return;
			}

			const undoneEditorState = EditorState.push(
				undoEditorState,
				removeLinkFromContent(
					link,
					undoEditorState.getCurrentContent()
				),
				CHANGE_TYPES.APPLY_ENTITY
			);

			return EditorState.forceSelection(
				undoneEditorState,
				undoEditorState.getSelection()
			);
		},
	};
}
