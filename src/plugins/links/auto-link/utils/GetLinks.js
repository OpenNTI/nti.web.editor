import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import { SelectionState } from 'draft-js';

const linkify = linkifyIt({}, { fuzzyEmail: false }).tlds(tlds);

export function getLinksInBlock(
	block,
	{ allowedInBlockTypes, ignoreEmails = true }
) {
	const text = block.getText();
	const key = block.getKey();

	if (
		!text ||
		(allowedInBlockTypes && !allowedInBlockTypes.has(block.getType()))
	) {
		return [];
	}
	if (!ignoreEmails) {
		throw new Error('This config has not been setup yet.');
	}

	const links = linkify.match(text) ?? [];

	return links.map(link => ({
		selection: new SelectionState({
			anchorKey: key,
			anchorOffset: link.index,
			focusKey: key,
			focusOffset: link.lastIndex,
		}),
		text: link.text,
		url: link.url,
	}));
}
