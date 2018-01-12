import {Modifier} from 'draft-js';
import linkifyIt from 'linkify-it';

import {createLinkEntity} from '../../../utils/';

import getSelectionForLink from './get-selection-for-link';

const linkify = linkifyIt();

function isExternalLink (link) {
	return link.schema === 'https:' || link.schema === 'http:';
}

export default function linkifyBlockInContent (block, content) {
	const text = block.getText();
	const links = linkify.match(text) || [];

	if (!links || !links.length) { return content; }

	for (let link of links) {
		if (isExternalLink(link)) {
			content = Modifier.applyEntity(content, getSelectionForLink(link, block), createLinkEntity(content, link.url).getLastCreatedEntityKey());
		}
	}

	return content;
}
