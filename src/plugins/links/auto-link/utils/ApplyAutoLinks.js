import {EditorState, Modifier, SelectionState} from 'draft-js';

import {CHANGE_TYPES} from '../../../../Constants';

import {getLinkBeforeSelection} from './GetLinks';
import {applyLink} from './ApplyLinks';

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

	if (!link) { return {editorState: nextEditorState, undo: null}; }

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

	return {
		editorState: newEditorState,
		undo: null
	};
}

export function handleReturn () {
	debugger;
}