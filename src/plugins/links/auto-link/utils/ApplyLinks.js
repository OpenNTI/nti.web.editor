import {Modifier} from 'draft-js';

import {isLinkEntity, createLinkEntity, updateLinkEntity} from '../../link-utils';

function getLinksInSelection (content, selection) {
	const blockKey = selection.getFocusKey();
	const focusOffset = selection.getFocusOffset();
	const anchorOffset = selection.getAnchorOffset();

	const block = content.getBlockForKey(blockKey);
	const characters = block.getCharacterList();

	const start = Math.min(focusOffset, anchorOffset);
	const end = Math.max(focusOffset, anchorOffset);

	const known = new Set();
	let links = [];

	for (let i = start; i <= end; i++) {
		const char = characters.get(i);
		const entityKey = char?.getEntity();
		const entity = entityKey && content.getEntity(entityKey);

		if (entity && isLinkEntity(entity) && !known.has(entityKey)) {
			known.add(entityKey);
			links.push({
				entity,
				key: entityKey
			});
		}
	}

	return links;
}


function applyNewLink (link, content) {
	const withEntity = createLinkEntity.createAutoLink(content, link.url);
	const entity = withEntity.getLastCreatedEntityKey();

	return Modifier.applyEntity(withEntity, link.selection, entity);
}

function updateExistingLink (existing, link, content) {
	//For now bail out of handling applying links over more than one
	//existing link, or if the link wasn't an auto link
	if (existing.length > 1) { return content; }
	if (!isLinkEntity.isAutoLink(existing[0].entity)) { return content; }

	const {key} = existing[0];

	return Modifier.applyEntity(
		updateLinkEntity(content, key, link.url),
		link.selection,
		key
	);
}

export function applyLink (link, content) {
	const existing = getLinksInSelection(content, link.selection);

	return existing.length > 0 ? updateExistingLink(existing, link, content) : applyNewLink(link, content);
}