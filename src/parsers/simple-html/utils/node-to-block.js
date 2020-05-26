import {genKey} from 'draft-js';

import {getBlockTypeForNode} from './BlockTypes';
import {getStyleForNode} from './StyleTypes';
import getTagName from './get-tag-name';

const getEntityKey = () => {
	getEntityKey.lastKey = (getEntityKey.lastKey || 0) + 1;

	return getEntityKey.lastKey;
};

const repeat = (value, times) => Array(times).fill(value);
const createCharInfo = (styles = [], entity) => ({styles, entity});

function parseText (node, styles = [], entity, entityMap) {
	const tagName = getTagName(node);

	if (tagName === '#text') {
		const text = node.textContent;

		return {
			text,
			charList: repeat(createCharInfo(styles), text.length)
		};
	}

	const style = getStyleForNode(node);
	const children = Array.from(node.childNodes);

	let text = '';
	let charList = [];

	for (let child of children) {
		const parsed = parseText(
			child,
			style ? ([...styles, style]) : ([...styles])
		);

		text += parsed.text;
		charList = [...charList, ...parsed.charList];
	}

	return {text, charList};	
}


function getInlineStyleRanges (charList) {
	const styleRanges = [];

	const getLength = (start, style) => {
		let length = 0;

		for (let i = start; i < charList.length; i++) {
			const char = charList[i];
			const styles = new Set(char.styles || []);
		
			if (styles.has(style)) {
				length += 1;
			} else {
				break;
			}
		}

		return length;
	};

	for (let i = 0; i < charList.length; i++) {
		const char = charList[i];
		const styles = char.styles || [];

		for (let style of styles) {
			styleRanges.push({
				style,
				offset: i,
				length: getLength(i, style)
			});
		}
	}

	return styleRanges;
}

function getEntityRanges (charList) {
	return [];
}

export default function nodeToBlock (node) {
	const entityMap = {};
	const blockType = getBlockTypeForNode(node);
	const {text, charList} = parseText(node, [], null, entityMap);

	return {
		block: {
			type: blockType,
			key: genKey(),
			text: text === '\uFEFF' ? '' : text,
			depth: 0,
			inlineStyleRanges: getInlineStyleRanges(charList),
			entityRanges: getEntityRanges(charList)
		},
		entityMap: {...entityMap}
	};
}