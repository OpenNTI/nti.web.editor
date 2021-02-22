import { Modifier, EditorState, SelectionState } from 'draft-js';

import { getSelectionForEntity } from '../../link-utils';
import { CHANGE_TYPES } from '../../../../Constants';

function getNewSelection(text, selection) {
	const anchorOffset = selection.getAnchorOffset();

	return new SelectionState({
		anchorKey: selection.getAnchorKey(),
		anchorOffset,
		focusKey: selection.getFocusKey(),
		focusOffset: anchorOffset + text.length,
	});
}

export default function updateEntityDesc(update, entityDesc, editorState) {
	const content = editorState.getCurrentContent();
	const { entityKey } = entityDesc;
	const entity = content.getEntity(entityKey);
	const entitySelection = getSelectionForEntity(
		entityKey,
		entityDesc.offsetKey,
		editorState
	);

	let newContent = content;
	let newSelection = null;

	if (entity.getData().href !== update.href) {
		//We're reapplying the same entity to force a new content record
		newContent = Modifier.applyEntity(
			newContent.mergeEntityData(entityKey, {
				href: update.href,
				isCustom: true,
				autoLink: false,
			}),
			entitySelection,
			entityKey
		);
	}

	if (entityDesc.decoratedText !== update.decoratedText) {
		newContent = Modifier.replaceText(
			newContent,
			entitySelection,
			update.decoratedText,
			void 0,
			entityKey
		);
		newSelection = getNewSelection(update.decoratedText, entitySelection);
	}

	if (newContent === content) {
		return editorState;
	}

	let newEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.INSERT_FRAGMENT
	);

	if (newSelection) {
		newEditorState = EditorState.forceSelection(
			newEditorState,
			newSelection
		);
	}

	return newEditorState;
}
