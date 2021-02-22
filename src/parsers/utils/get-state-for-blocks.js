import { ContentState, EditorState } from 'draft-js';

export default function getStateForBlocks(blocks) {
	const content = blocks.length
		? ContentState.createFromBlockArray(blocks)
		: ContentState.createFromText('');

	return EditorState.createWithContent(content);
}
