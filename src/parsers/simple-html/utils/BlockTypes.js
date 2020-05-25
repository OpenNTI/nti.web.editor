import {parent} from '@nti/lib-dom';

import {BLOCKS} from '../../../Constants';

import getTagName from './get-tag-name';

const BlocksToTag = {
	[BLOCKS.UNSTYLED]: 'p',
	[BLOCKS.BLOCKQUOTE]: 'blockquote',
	[BLOCKS.CODE]: 'pre',
	[BLOCKS.HEADER_ONE]: 'h1',
	[BLOCKS.HEADER_TWO]: 'h2',
	[BLOCKS.HEADER_THREE]: 'h3',
	[BLOCKS.HEADER_FOUR]: 'h4',
	[BLOCKS.HEADER_FIVE]: 'h5',
	[BLOCKS.HEADER_SIX]: 'h6',
	[BLOCKS.ORDERED_LIST_ITEM]: 'li',
	[BLOCKS.UNORDERED_LIST_ITEM]: 'li'
};

const TagsToBlocks = {};

for (let [key, value] of Object.entries(BlocksToTag)) {
	TagsToBlocks[value] = [...(TagsToBlocks[value] || []),key];
}

const validNodesSelector = 'p, blockquote, pre, h1, h2, h3, h4, h5, h6, li';
export function getValidNodes (node) {
	const nodes = Array.from(node.querySelectorAll(validNodesSelector))
		.reduce((acc, valid) => {
			const subValid = getValidNodes(valid);

			if (subValid.length > 0) { return [...acc, ...subValid]; }

			return [...acc, valid];
		}, []);

	return Array.from(new Set(nodes));
}

export function getBlockTypeForNode (node) {
	const tagName = getTagName(node);
	const blocks = TagsToBlocks[tagName];

	if (blocks.length === 1) { return blocks[0]; }

	if (tagName === 'li') {
		const listParent = parent(node, 'ul,ol');
		const type = listParent ? getTagName(listParent) : null;

		if (!type) { throw new Error('Invalid List Item'); }

		if (type === 'ul') { return BLOCKS.UNORDERED_LIST_ITEM; }
		if (type === 'ol') { return BLOCKS.ORDERED_LIST_ITEM; }
	}

	throw new Error(`Unknown node type: ${tagName}`);
}

export function getTagNameForBlockType (blockType) {

}