import { genKey } from 'draft-js';

import { getBlockTypeForNode, getBlockDepthForNode } from './BlockTypes';
import { getStyleForNode } from './StyleTypes';
import { getEntityForNode } from './EntityTypes';
import getTagName from './get-tag-name';

const getEntityKey = () => {
	getEntityKey.lastKey = (getEntityKey.lastKey || 0) + 1;

	return getEntityKey.lastKey;
};

const repeat = (value, times) => Array(times).fill(value);
const createCharInfo = (styles = [], entity) => ({ styles, entity });

function parseText(node, styles = [], entity, createEntity) {
	const tagName = getTagName(node);

	if (tagName === '#text') {
		const text = node.textContent;

		return {
			text,
			charList: repeat(createCharInfo(styles, entity), text.length),
		};
	}

	const style = getStyleForNode(node);
	const newEntity = createEntity(getEntityForNode(node));
	const children = Array.from(node.childNodes);

	let text = '';
	let charList = [];

	for (let child of children) {
		const parsed = parseText(
			child,
			style ? [...styles, style] : [...styles],
			newEntity,
			createEntity
		);

		text += parsed.text;
		charList = [...charList, ...parsed.charList];
	}

	return { text, charList };
}

function getInlineStyleRanges(charList) {
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
				length: getLength(i, style),
			});
		}
	}

	return styleRanges;
}

function getEntityRanges(charList) {
	const entityRanges = [];

	for (let i = 0; i < charList.length; i++) {
		const char = charList[i];
		const { entity } = char;

		if (!entity) {
			continue;
		}

		const lastEntity = entityRanges[entityRanges.length - 1];

		if (lastEntity?.key === entity) {
			lastEntity.length += 1;
		} else {
			entityRanges.push({
				offset: i,
				length: 1,
				key: entity,
			});
		}
	}

	return entityRanges;
}

export default function nodeToBlock(node) {
	const entityMap = {};
	const createEntity = data => {
		if (!data) {
			return null;
		}

		const key = getEntityKey();

		entityMap[key] = data;
		return key;
	};

	const blockType = getBlockTypeForNode(node);
	const depth = getBlockDepthForNode(node);
	const { text, charList } = parseText(node, [], null, createEntity);

	return {
		block: {
			type: blockType,
			key: genKey(),
			text: text === '\uFEFF' ? '' : text,
			depth,
			inlineStyleRanges: getInlineStyleRanges(charList),
			entityRanges: getEntityRanges(charList),
		},
		entityMap: { ...entityMap },
	};
}
