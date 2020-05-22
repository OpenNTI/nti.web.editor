import {getStateForBlocks} from '../utils';

import {nodeToBlock, BlockTypes} from './utils';

function getSafeBody (html) {
	try {
		const doc = document?.implementation?.createHTMLDocument?.('scratchpad');
		doc.documentElement.innerHTML = html;

		return doc.getElementsByTagName('body')[0];
	} catch (e) {
		return null;
	}

}

function getBlocksForHTML (html) {
	const body = getSafeBody(html);
	const nodes = BlockTypes.getValidNodes(body);

	return nodes
		.map(n => nodeToBlock(n))
		.filter(Boolean);
}

export default function toDraftState (html) {
	if (!Array.isArray(html)) { html = [html]; }

	let editorState = null;

	for (let part of html) {
		if (typeof part === 'string') {
			const blocks = getBlocksForHTML(part);

			editorState = getStateForBlocks(blocks);
		}
	}

	return editorState;
}