import linkifyIt from 'linkify-it';
import {EditorState, Modifier, SelectionState} from 'draft-js';

import {CHANGE_TYPES} from '../../../../Constants';

import applyLinkToBlock from './apply-link-to-block';
import removeLinkFromBlock from './remove-link-from-block';

const linkify = linkifyIt();

const IS_WHITE_SPACE = /\s/;

function endsInSpace (chars) {
	const last = chars.charAt(chars.length - 1);

	return last === ' ';
}


function getWordBeforeOffset (block, offset) {
	const text = block.getText();

	let word = '';
	let current = offset - 1;

	while (current >= 0) {
		const char = text.charAt(current);

		if (IS_WHITE_SPACE.test(char)) {
			return word;
		}

		word = `${char}${word}`;
		current -= 1;
	}

	return word;
}


function isSameState (a, b) {
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


export default function maybeTurnLastWordIntoLink (chars, editorState) {
	const selection = editorState.getSelection();

	if (!endsInSpace(chars) || !selection.isCollapsed()) { return null; }

	const content = editorState.getCurrentContent();
	const blockKey = selection.getFocusKey();
	const offset = selection.getFocusOffset();
	const block = content.getBlockForKey(blockKey);

	const word = getWordBeforeOffset(block, offset);
	const links = word && linkify.match(word);

	if (!links || !links.length) { return null; }

	const link = links[0];

	let newContent = Modifier.insertText(content, selection, chars, editorState.getCurrentInlineStyle(), null);
	let newEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.INSERT_CHARACTERS
	);


	newContent = applyLinkToBlock(block, link, offset - link.lastIndex, newContent);
	newEditorState = EditorState.push(
		newEditorState,
		newContent,
		CHANGE_TYPES.APPLY_ENTITY
	);

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
		undo: (undoEditorState) => {
			if (!isSameState(undoEditorState, newEditorState)) { return; }

			const undoneEditorState = EditorState.push(
				undoEditorState,
				removeLinkFromBlock(block, link, offset - link.lastIndex, undoEditorState.getCurrentContent()),
				CHANGE_TYPES.APPLY_ENTITY
			);

			return EditorState.forceSelection(undoneEditorState, undoEditorState.getSelection());
		}
	};
}
