import {EditorState, Modifier, SelectionState} from 'draft-js';

import {CHANGE_TYPES} from '../../../../Constants';

import {getLinkBeforeSelection, getNotMarkedLinks} from './GetLinks';
import {applyLink} from './ApplyLinks';

export function onChange (editorState, config) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const newLinks = getNotMarkedLinks(content, config);

	if (!newLinks.length) { return editorState; }

	const newContent = newLinks.reduce((acc, link) => {
		return applyLink(link, acc);
	}, content);

	return EditorState.forceSelection(
		EditorState.push(editorState, newContent, CHANGE_TYPES.APPLY_ENTITY),
		selection
	);
}

export function beforeInput (chars, editorState, config) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();
	const modify = selection.isCollapsed() ? Modifier.insertText : Modifier.replaceText;

	let newContent = modify(content, selection, chars, editorState.getCurrentInlineStyle(), null);
	let newEditorState = editorState;

	//Do a dry run of applying the chars so what was
	//just typed gets linkified.
	let nextEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.INSERT_CHARACTERS
	);

	const link = getLinkBeforeSelection(nextEditorState.getCurrentContent(), nextEditorState.getSelection(), config);

	if (!link) { return null; }

	newContent = applyLink(link, newContent);
	newEditorState = EditorState.push(newEditorState, newContent, CHANGE_TYPES.APPLY_ENTITY);

	newEditorState = EditorState.forceSelection(
		newEditorState,
		new SelectionState({
			focusKey: selection.getFocusKey(),
			focusOffset: selection.getFocusOffset() + chars.length,
			anchorKey: selection.getAnchorKey(),
			anchorOffset: selection.getAnchorOffset() + chars.length
		})
	);

	return newEditorState;
}

export function handleReturn (editorState) {
	//Since we are adding the links on change and on beforeInput I don't think this is needed
}