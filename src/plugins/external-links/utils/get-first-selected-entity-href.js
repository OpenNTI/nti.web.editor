import {Entity} from 'draft-js';

function getFirstEntityKeyInBlock (block, start, end) {
	start = start || 0;
	end = end || block.text.length;

	for (let i = start; i <= end; i++) {
		let entity = block.getEntityAt(i);

		if (entity) {
			return entity;
		}
	}
}

function getFirstEntityKey (editorState) {
	const selection = editorState.getSelection();
	const content = editorState.getCurrentContent();
	const start = selection.getStartKey();
	const end = selection.getEndKey();

	if (start !== end) { return null; }

	return getFirstEntityKeyInBlock(content.getBlockForKey(start), selection.getStartOffset(), selection.getEndOffset());
}

export default function getFirstSelectedEntityHref (editorState) {
	const entityKey = getFirstEntityKey(editorState);
	const entity = entityKey && Entity.get(entityKey);
	const link = entity && entity.data && entity.data.href;

	return link || '';
}
