import {convertFromRaw, ContentState, EditorState} from 'draft-js';

import {BLOCKS} from '../../../Constants';

import {nodeToBlock, getNodesFromHTML} from './utils';


function getContentForHTML (html) {
	const nodes = getNodesFromHTML(html);

	const rawContent = nodes.reduce(({blocks, entityMap:existingEntities}, node) => {
		const {block, entityMap} = nodeToBlock(node);

		return {
			blocks: [...blocks, block],
			entityMap: {...existingEntities, ...(entityMap || {})}
		};
	}, {blocks: [], entityMap: {}});

	return convertFromRaw(rawContent);
}

export default function toDraftState (html) {
	if (!Array.isArray(html)) { html = [html]; }

	let editorState = null;
	let lastBlockWasAtomic = false;

	for (let part of html) {
		if (typeof part === 'string') {
			const existingContent = editorState?.getCurrentContent();
			const existingBlocks = existingContent?.getBlocksAsArray() ?? [];
			const existingEntities = existingContent?.getEntityMap() ?? {};

			// Inserting atomic blocks also inserts a blank text block after it...
			// if we encounter that block, drop it because we have text here (and we
			// don't want to add additional lines when we don't have to)
			const lastBlock = existingBlocks[existingBlocks.length - 1];
			if (lastBlockWasAtomic && lastBlock && lastBlock.getText() === '' && lastBlock.type === BLOCKS.UNSTYLED) {
				existingBlocks.pop();
			}

			const newContent = getContentForHTML(part);
			const newBlocks = newContent?.getBlocksAsArray() ?? [];
			const newEntities = newContent?.getEntityMap() ?? {};

			const combinedBlocks = [...existingBlocks, ...newBlocks];
			const combinedEntities = {...existingEntities, ...newEntities};

			let combinedContent = ContentState.createFromBlockArray(combinedBlocks);

			for (let value of Object.values(combinedEntities)) {
				combinedContent = combinedContent.addEntity(value);
			}

			lastBlockWasAtomic = false;
			editorState = EditorState.createWithContent(combinedContent);
		}
	}

	return editorState;
}