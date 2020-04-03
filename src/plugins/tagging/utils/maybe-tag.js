import {EditorState, Modifier, SelectionState} from 'draft-js';

import {CHANGE_TYPES} from '../../../Constants';

import {findNewTagBeforeSelection, findExistingTagBeforeSelection} from './find-tags';

function createTagEntity (content, strat) {
	return content.createEntity(strat.type, strat.mutability, strat.getEntityData()).getLastCreatedEntityKey();
}

export function onChange (strategies, editorState) {
	//TODO: fill this in
	return editorState;
}

export function beforeInput (strategies, chars, editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const existingTag = findExistingTagBeforeSelection(strategies, editorState);

	if (existingTag) {
		return EditorState.push(
			editorState,
			Modifier.insertText(
				content,
				selection,
				chars,
				editorState.getCurrentInlineStyle(),
				existingTag.strategy.isValidContinuation(chars) ? existingTag.entity : null
			),
			CHANGE_TYPES.INSERT_CHARACTERS
		);
	}

	const nextEditorState = EditorState.push(
		editorState,
		Modifier.insertText(content, selection, chars, editorState.getCurrentInlineStyle(), null),
		CHANGE_TYPES.INSERT_CHARACTERS
	);

	const newTag = findNewTagBeforeSelection(strategies, nextEditorState);
	
	if (!newTag) { return nextEditorState; }

	let newContent = Modifier.insertText(content, selection, chars, null, null);
	newContent = Modifier.applyEntity(newContent, newTag.selection, createTagEntity(newContent, newTag.strategy));

	const newEditorState = EditorState.push(editorState, newContent, CHANGE_TYPES.APPLY_ENTITY);

	return EditorState.forceSelection(
		newEditorState,
		new SelectionState({
			focusKey: selection.getFocusKey(),
			focusOffset: selection.getFocusOffset() + chars.length,
			anchorKey: selection.getAnchorKey(),
			anchorOffset: selection.getAnchorOffset() + chars.length
		})
	);
}

export function afterInput () {
	debugger;
}