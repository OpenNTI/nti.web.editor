import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import {SelectionState} from 'draft-js';

const linkify = linkifyIt().tlds(tlds);
const IsWhiteSpace = /\s/;

function getWordBeforeOffset (block, offset) {
	const text = block.getText();

	let word = '';
	let current = offset;

	while (current >= 0) {
		const char = text.charAt(current);
	
		if (IsWhiteSpace.test(char)) {
			return word;
		}

		word = `${char}${word}`;
		current -= 1;
	}

	return word;
}

function getLinkForWord (word) {
	const links = word && linkify.match(word);

	return links && links[0];
}

export function getLinkBeforeSelection (content, selection, {allowedInBlockTypes}) {
	const focusKey = selection.getFocusKey();
	const anchorKey = selection.getAnchorKey();

	if (focusKey !== anchorKey) { return null; }

	const focusOffset = selection.getFocusOffset();
	const anchorOffset = selection.getAnchorOffset();
	const offset = Math.min(focusOffset, anchorOffset);

	const block = content.getBlockForKey(focusKey);

	if (allowedInBlockTypes && !allowedInBlockTypes.has(block.getType())) { return null; }

	const word = getWordBeforeOffset(block, offset);
	const link = getLinkForWord(word);
	
	if (!link) { return null; }

	const newAnchorOffset = offset - word.length;

	return {
		selection: new SelectionState({
			anchorKey: anchorKey,
			anchorOffset: newAnchorOffset,
			focusKey: focusKey,
			focusOffset: newAnchorOffset + link.lastIndex
		}),
		text: link.text,
		url: link.url
	};
}