import {Modifier, EditorState, SelectionState} from 'draft-js';

import {STYLE_SET} from '../../../Constants';

function setToMap (a) {
	let acc = {};

	a.forEach(x => acc[x] = true);

	return acc;
}

function diff (allowed, all) {
	const allowedMap = setToMap(allowed);

	return Array.from(all).filter(x => !allowedMap[x]);
}

function computeDisallowedStyles (allowedStyles) {
	return diff(allowedStyles, STYLE_SET);
}

function cleanStyles (disallowed, content, range, block) {
	let styles = new Set();

	block.findStyleRanges(x => styles = new Set([...styles, ...x.getStyle()]), () => {});

	for (let style of styles) {
		if (disallowed[style]) {
			content = Modifier.removeInlineStyle(content, range, style);
		}
	}

	return content;
}

export default function fixStateForAllowed (editorState, allowed, byBlockType) {
	//TODO: instead of just checking the size check that they are the same set
	if (allowed.size === STYLE_SET.size) { return editorState; }

	const disallowedStyles = allowed && computeDisallowedStyles(allowed);
	const styleMap = disallowedStyles && setToMap(disallowedStyles);

	let content = editorState.getCurrentContent();
	const originalContent = content;

	for (let block of content.getBlocksAsArray()) {
		const blockKey = block.getKey();
		const type = block.getType();

		const byType = byBlockType[type];
		const disallowedByType = byType && computeDisallowedStyles(byType);
		const typeStyleMap = disallowedByType && setToMap(disallowedByType);

		const range = new SelectionState({
			anchorKey: blockKey,
			anchorOffset: 0,
			focusKey: blockKey,
			focusOffset: block.getLength()
		});

		if (disallowedStyles && disallowedStyles.length > 0) {
			content = cleanStyles(styleMap, content, range, block);
		}

		if (disallowedByType && disallowedByType.length > 0) {
			content = cleanStyles(typeStyleMap, content, range, block);
		}
	}

	if (content === originalContent) { return editorState; }

	return EditorState.set(editorState, {
		currentContent: content
	});
}
