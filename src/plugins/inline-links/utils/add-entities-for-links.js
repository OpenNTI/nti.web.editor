import {EditorState} from 'draft-js';

import linkifyBlockInContent from './linkify-block-in-content';

export default function addEntitiesForLinks (editorState) {
	let content = editorState.getCurrentContent();
	const originalContent = content;

	for (let block of content.getBlocksAsArray()) {
		content = linkifyBlockInContent(block, content);
	}

	if (content === originalContent) { return editorState; }

	return EditorState.set(editorState, {
		currentContent: content
	});
}
