import { SelectionState, EditorState, Modifier } from 'draft-js';

import { CHANGE_TYPES } from '../../../Constants';
import { createLinkEntity } from '../../../utils';

import replaceEntityTextAtSelection from './replace-entity-text-at-selection';
import getSelectionForEntityKeyAtOffset from './get-selection-for-entity-key-at-offset';

function createLinkAtSelection(link, text, editorState, selection) {
	const content = editorState.getCurrentContent();
	const entity = createLinkEntity(
		content,
		link,
		false,
		{}
	).getLastCreatedEntityKey();

	const newContent = Modifier.applyEntity(content, selection, entity);
	const newEditorState = EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.APPLY_ENTITY
	);

	if (!text) {
		return newEditorState;
	}

	return replaceEntityTextAtSelection(
		text,
		entity,
		selection,
		newEditorState
	);
}

function createSelectionForBlock(block, start, end) {
	start = start || 0;
	end = end || block.text.length;

	return new SelectionState({
		anchorKey: block.key,
		anchorOffset: start,
		focusKey: block.key,
		focusOffset: end,
		isBackward: false,
		hasFocus: false,
	});
}

export default function createNewLinkAtOffset(
	link,
	text,
	entityKey,
	offsetKey,
	editorState
) {
	const selection = getSelectionForEntityKeyAtOffset(
		entityKey,
		offsetKey,
		editorState
	);
	const start = selection.getStartKey();
	const end = selection.getEndKey();

	if (start === end) {
		return createLinkAtSelection(link, text, editorState, selection);
	}

	const content = editorState.getCurrentContent();

	let newState = createLinkAtSelection(
		link,
		void 0,
		editorState,
		createSelectionForBlock(
			content.getBlockForKey(start),
			selection.getStartOffset()
		)
	);

	let nextBlock = content.getBlockAfter(start);

	while (nextBlock.key !== end) {
		newState = createLinkAtSelection(
			link,
			void 0,
			newState,
			createSelectionForBlock(nextBlock)
		);
		nextBlock = content.getBlockAfter(nextBlock.key);
	}

	newState = createLinkAtSelection(
		link,
		void 0,
		newState,
		createSelectionForBlock(
			content.getBlockForKey(end),
			0,
			selection.getEndOffset()
		)
	);

	return newState;
}
