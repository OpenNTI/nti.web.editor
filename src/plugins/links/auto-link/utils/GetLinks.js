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

export function getLinkForWord (word) {
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

function getNotMarkedInBlock (block, content) {
	const key = block.getKey();
	const text = block.getText();
	const characters = block.getCharacterList();
	const links = linkify.match(text);

	if (!links || !links.length) { return []; }

	//As a shortcut for now we are assuming if there is
	//an entity on any of the matched text, we should
	//consider it marked
	return links.reduce((acc, link) => {
		for (let i = link.index; i < link.lastIndex; i++) {
			const character = characters.get(i);

			if (character.entity) {
				return acc;
			}
		}

		return [
			...acc,
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
		];
	}, []);
}

export function getNotMarkedLinks (content, {allowedInBlockTypes}) {
	return content
		.getBlocksAsArray()
		.reduce((acc, block) => {
			if (allowedInBlockTypes && !allowedInBlockTypes.has(block.getType())) { return acc; }
		
			return [
				...acc,
				...getNotMarkedInBlock(block, content)
			];
		}, []);
}




export function getLinksInBlock (block, {allowedInBlockTypes}) {
	const text = block.getText();
	const key = block.getKey();

	if (!text || (allowedInBlockTypes && !allowedInBlockTypes.has(block.getTypes()))) { return []; }

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