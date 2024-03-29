import { EditorState, Modifier, SelectionState } from 'draft-js';

import { CHANGE_TYPES } from '../../../Constants';

import { getSelectionForTag } from './find-tags';

export function setSuggestion(
	suggestion,
	suggestionDisplay,
	appliedSearch = '',
	strategy,
	entityKey,
	blockKey,
	offsetKey,
	editorState
) {
	const content = editorState.getCurrentContent();
	const selection = getSelectionForTag(entityKey, editorState, blockKey);

	const displayText = strategy.getDisplayText(suggestion, suggestionDisplay);

	let newContent = content.mergeEntityData(entityKey, {
		[strategy.suggestionKey]: suggestion,
	});

	newContent = Modifier.replaceText(
		newContent,
		new SelectionState({
			anchorKey: selection.getAnchorKey(),
			focusKey: selection.getFocusKey(),
			anchorOffset: selection.getAnchorOffset(),
			focusOffset: selection.getFocusOffset() + appliedSearch.length,
		}),
		displayText,
		null,
		entityKey
	);

	newContent = Modifier.insertText(
		newContent,
		new SelectionState({
			anchorKey: selection.getAnchorKey(),
			focusKey: selection.getFocusKey(),
			anchorOffset: selection.getAnchorOffset() + displayText.length,
			focusOffset: selection.getAnchorOffset() + displayText.length,
		}),
		' '
	);

	return EditorState.forceSelection(
		EditorState.push(
			editorState,
			newContent,
			CHANGE_TYPES.INSERT_CHARACTERS
		),
		new SelectionState({
			anchorKey: selection.getAnchorKey(),
			focusKey: selection.getFocusKey(),
			anchorOffset: selection.getAnchorOffset() + displayText.length + 1,
			focusOffset: selection.getAnchorOffset() + displayText.length + 1,
		})
	);
}

export function getSuggestion(
	strategy,
	entityKey,
	blockKey,
	offsetKey,
	editorState
) {
	const content = editorState.getCurrentContent();

	const entity = content.getEntity(entityKey);
	const data = entity?.data ?? {};

	return data[strategy.suggestionKey];
}

export function getSuggestionSearch(
	strategy,
	entity,
	blockKey,
	offsetKey,
	editorState
) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const block = content.getBlockForKey(blockKey);
	const text = block?.getText();
	const chars = block?.getCharacterList()?.toArray();

	const startOfEntity = chars?.findIndex(char => char.entity === entity);
	const endOfSelection = selection.getEndOffset();

	if (startOfEntity == null || endOfSelection <= startOfEntity) {
		return null;
	}

	const searchTerm = text?.substring(startOfEntity, endOfSelection) ?? '';
	const searchChars = searchTerm.split('').slice(1); //all the chars in the entity selection minus the trigger

	let validSearch = '';

	for (let searchChar of searchChars) {
		if (strategy.isValidMember(searchChar)) {
			validSearch += searchChar;
		} else {
			return validSearch;
		}
	}

	return validSearch;
}
