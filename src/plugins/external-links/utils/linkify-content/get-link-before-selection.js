import linkifyIt from 'linkify-it';
import { SelectionState } from 'draft-js';

const linkify = linkifyIt();

const IS_WHITE_SPACE = /\s/;

function getWordBeforeOffset(block, offset) {
	const text = block.getText();

	let word = '';
	let current = offset - 1;

	while (current >= 0) {
		const char = text.charAt(current);

		if (IS_WHITE_SPACE.test(char)) {
			return word;
		}

		word = `${char}${word}`;
		current -= 1;
	}

	return word;
}

export default function getLinkBeforeSelection(editorState, allowedIn) {
	const selection = editorState.getSelection();
	const focusKey = selection.getFocusKey();
	const anchorKey = selection.getAnchorKey();

	if (focusKey !== anchorKey) {
		return null;
	}

	const focusOffset = selection.getFocusOffset();
	const anchorOffset = selection.getAnchorOffset();
	const offset = Math.min(focusOffset, anchorOffset);

	const content = editorState.getCurrentContent();
	const block = content.getBlockForKey(focusKey);

	if (allowedIn && !allowedIn.has(block.getType())) {
		return null;
	}

	const word = getWordBeforeOffset(block, offset);
	const links = word && linkify.match(word);

	if (!links || !links.length) {
		return null;
	}

	const link = links[0];
	const newAnchorOffset = offset - word.length;

	return {
		selection: new SelectionState({
			anchorKey: anchorKey,
			anchorOffset: newAnchorOffset,
			focusKey: focusKey,
			focusOffset: newAnchorOffset + link.lastIndex,
		}),
		url: link.url,
	};
}
