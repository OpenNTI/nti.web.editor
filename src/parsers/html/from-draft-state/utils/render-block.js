import getBlockTags from './get-block-tags';
import renderContentBlockContent from './render-content-block-content';

export default function renderBlock (editorState, block, key) {
	const content = editorState.getCurrentContent();

	if (block.type === 'atomic') {
		const entityKey = block.getEntityAt(0);
		const entity = entityKey && content.getEntity(entityKey);

		return entity ? entity.data : null;
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
