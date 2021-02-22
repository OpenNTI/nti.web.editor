import { getAtomicBlockData } from '../../../../utils';

import getBlockTags from './get-block-tags';
import renderContentBlockContent from './render-content-block-content';

export default function renderBlock(editorState, strategy, block, key) {
	const content = editorState.getCurrentContent();

	if (block.type === 'atomic') {
		return getAtomicBlockData(block, editorState, true);
	}

	const prev = content.getBlockBefore(key);
	const next = content.getBlockAfter(key);
	const tree = editorState.getBlockTree(block.getKey());

	const [prefix, postfix] = getBlockTags(block, prev, next, strategy);

	return {
		type: block.type,
		prefix,
		postfix,
		content: renderContentBlockContent(tree, block, content),
	};
}
