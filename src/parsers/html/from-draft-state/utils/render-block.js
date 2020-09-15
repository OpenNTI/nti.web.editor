import {getAtomicBlockData} from '../../../../utils';

import getBlockTags from './get-block-tags';
import renderContentBlockContent from './render-content-block-content';

export default function renderBlock (editorState, block, key) {
	const content = editorState.getCurrentContent();

	if (block.type === 'atomic') {
		return getAtomicBlockData(block, editorState);
	}

	const prev = content.getBlockBefore(key);
	const next = content.getBlockAfter(key);
	const tree = editorState.getBlockTree(block.getKey());

	const [prefix, postfix] = getBlockTags(block, prev, next);

	return {
		type: block.type,
		prefix,
		postfix,
		content: renderContentBlockContent(tree, block, content)
	};
}
