import {genKey, ContentBlock, CharacterMetadata} from 'draft-js';
import {List} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

import {getBlockTypeForNode} from './BlockTypes';
import {getStyleForNode} from './StyleTypes';
import getTagName from './get-tag-name';

const getEntityKey = () => {
	getEntityKey.lastKey = (getEntityKey.lastKey || 0) + 1;

	return getEntityKey.lastKey;
};

const repeat = (value, times) => Array(times).fill(value);
const createCharInfo = (styles = [], entity) => ({styles, entity});

function parseText (node, styles = []) {
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

function convertCharlist (charList) {
	return List(
		charList.map(char => {
			let meta = CharacterMetadata.create({});

			meta = CharacterMetadata.applyEntity(meta, char.entity);

			for ( let style of char.styles) {
				meta = CharacterMetadata.applyStyle(meta, style);
			}

			return meta;
		})
	);
}

export default function nodeToBlock (node) {
	const blockType = getBlockTypeForNode(node);
	const {text, charList} = parseText(node)

	if (text === '\uFEFF')

	return new ContentBlock({
		type: blockType,
		key: genKey(),
		depth: 0,
		text: text === '\uFEFF' ? '' : text,
		characterList: convertCharlist(charList)
	});
}