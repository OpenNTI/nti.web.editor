import { Modifier } from 'draft-js';

import { createLinkEntity } from '../../../../utils';

export default function applyLinkToBlock(link, content) {
	const entity = createLinkEntity(
		content,
		link.url
	).getLastCreatedEntityKey();

	return Modifier.applyEntity(content, link.selection, entity);
}
