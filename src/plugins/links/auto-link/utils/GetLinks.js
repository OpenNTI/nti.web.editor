import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import {SelectionState} from 'draft-js';

const linkify = linkifyIt().tlds(tlds);

export function getLinksInBlock (block, {allowedInBlockTypes}) {
	const text = block.getText();
	const key = block.getKey();

	if (!text || (allowedInBlockTypes && !allowedInBlockTypes.has(block.getType()))) { return []; }

	const links = linkify.match(text) ?? [];

	return links.map((link) => (
		{
			selection: new SelectionState({
				anchorKey: key,
				anchorOffset: link.index,
				focusKey: key,
				focusOffset: link.lastIndex
			}),
			text: link.text,
			url: link.url
		}
	));
}