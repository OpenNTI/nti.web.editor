import {EditorState, SelectionState, AtomicBlockUtils} from 'draft-js';

import {insertAtomicBlocks} from '../../../../utils';

function getSelectionAtEndOfBlock (blockKey, content) {
	const block = content.getBlockForKey(blockKey);
	const offset = block.getText().length;

	return new SelectionState({
		focusKey: blockKey,
		anchorKey: blockKey,
		focusOffset: offset,
		anchorOffset: offset
	});
}

export function insert (link, getDataForLink, content) {
	const data = getDataForLink(link.entity.data);
	const selection = getSelectionAtEndOfBlock(link.blockKey, content);
	
	const tempEditorState = insertAtomicBlocks(data, selection, EditorState.create({currentContent: content, selection}));
	const newContent = tempEditorState.getCurrentContent();
	const preview = newContent.getLastCreatedEntityKey();

	return {
		preview,
		content: newContent.mergeEntityData(link.entityKey, {'has-preview': 'preview'})
	};
}

export function update (existing, link, getDataForLink, content) {
	const data = getDataForLink(link.entity.data);

	return {
		preview: existing,
		content: content.mergeEntityData(existing, data)
	};
}