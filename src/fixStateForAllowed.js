import {EditorState, Modifier, SelectionState} from 'draft-js';

import {STYLE_SET, BLOCK_SET, BLOCKS} from './Constants';


function arrayToMap (a) {
	return a.reduce((acc, x) => {
		acc[x] = true;

		return acc;
	}, {});
}


function diff (allowed, all) {
	const allowedMap = arrayToMap(allowed);

	return all.filter(x => !allowedMap[x]);
}


function computeDisallowedBlocks (allowedBlocks) {
	return diff(allowedBlocks, BLOCK_SET);
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


function cleanBlock (disallowed, content, range, block) {
	if (disallowed[block.type] && block.type !== BLOCKS.UNSTYLED) {
		content = Modifier.setBlockType(content, range, BLOCKS.UNSTYLED);
	}

	return content;
}


function cleanLinks (content/*, range, block*/) {
	//TODO: fill this out

	return content;
}

export default function fixStateForAllowed (newState, allowedStyles = [], allowedBlocks = [], allowLinks = true) {
	const disallowedStyles = computeDisallowedStyles(allowedStyles);
	const disallowedBlocks = computeDisallowedBlocks(allowedBlocks);

	if (disallowedStyles.length > 0 && disallowedBlocks.length > 0 && allowLinks) { return newState; }

	const styleMap = arrayToMap(disallowedStyles);
	const blockMap = arrayToMap(disallowedBlocks);

	let content = newState.getCurrentContent();
	const originalContent = content;

	for (let block of content.getBlocksAsArray()) {
		const blockKey = block.getKey();
		const range = new SelectionState({
			anchorKey: blockKey,
			anchorOffset: 0,
			focusKey: blockKey,
			focusOffset: block.getLength()
		});

		if (disallowedStyles.length > 0) {
			content = cleanStyles(styleMap, content, range, block);
		}

		if (!allowLinks) {
			content = cleanLinks(content, range, block);
		}

		if (disallowedBlocks.length > 0) {
			content = cleanBlock(blockMap, content, range, block);
		}
	}

	const blocks = content.getBlocksAsArray();

	if (blocks.length < 1) { return EditorState.createEmpty(); }

	if (content === originalContent) { return newState; }

	return EditorState.create({
		currentContent: content,
		allowUndo: newState.getAllowUndo(),
		decorator: newState.getDecorator(),
		selection: newState.getSelection()
	});
}
