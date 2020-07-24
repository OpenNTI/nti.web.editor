import {Modifier} from 'draft-js';

import {isLinkEntity, createLinkEntity, updateLinkEntity} from '../../link-utils';

import {getLinkForWord} from './GetLinks';

function getLinksInSelection (content, selection) {
	const blockKey = selection.getFocusKey();
	const focusOffset = selection.getFocusOffset();
	const anchorOffset = selection.getAnchorOffset();

	const block = content.getBlockForKey(blockKey);
	const characters = block.getCharacterList();
	const text = block.getText();

	const start = Math.min(focusOffset, anchorOffset);
	const end = Math.max(focusOffset, anchorOffset);

	const links = {};

	for (let i = start; i <= end; i++) {
		const char = characters.get(i);
		const entityKey = char?.getEntity();
		const entity = entityKey && content.getEntity(entityKey);

		if (!entity || !isLinkEntity(entity)) { continue; }

		if (links[entityKey]) {
			links[entityKey].end = i;
			links[entityKey].text += text.charAt(i);
		} else {
			links[entityKey] = {
				start: i,
				text: text.charAt(i),
				entity,
				entityKey
			};
		}
	}

	return Object.values(links);
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

	const updating = existing[0];
	const {entityKey} = updating;
	
	let newContent = updateLinkEntity(content, entityKey, link.url);

	newContent = Modifier.applyEntity(newContent, link.selection, entityKey);

	return newContent;
}

export function applyLink (link, content) {
	const existing = getLinksInSelection(content, link.selection);

	return existing.length > 0 ? updateExistingLink(existing, link, content) : applyNewLink(link, content);
}

export function applyLinks (links, content) {
	return links.reduce((acc, link) => applyLink(link, acc), content);
}
