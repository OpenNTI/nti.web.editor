import {EditorState, Modifier, Entity} from 'draft-js';

import {getRangeForBlock} from '../../../utils';
import {ENTITIES} from '../../../Constants';

function removeLinkFromBlock (block, content) {
	return Modifier.applyEntity(content, getRangeForBlock(block), null);
}


function hasEntityRanges (block) {
	let found = false;

	//If findEntityRanges ever becomes async this will break
	block.findEntityRanges((character) => {
		const entityKey = character.getEntity();

		return entityKey !== null && Entity.get(entityKey).getType() === ENTITIES.LINK;
	}, () => {
		found = true;
	});

	return found;
}


export default function fixStateForAllowed (editorState, allowedSet) {
	if (!allowedSet) { return editorState; }

	let content = editorState.getCurrentContent();
	const originalContent = content;

	for (let block of content.getBlocksAsArray()) {
		if (!allowedSet.has(block.type) && hasEntityRanges(block)) {
			content = removeLinkFromBlock(block, content);
		}
	}

	if (content === originalContent) { return editorState; }

	return EditorState.set(editorState, {
		currentContent: content
	});
}
