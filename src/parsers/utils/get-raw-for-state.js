import { convertToRaw, ContentState } from 'draft-js';

export default function getRawForState(editorState) {
	const currentContent =
		editorState instanceof ContentState
			? editorState
			: editorState?.getCurrentContent();

	return convertToRaw(currentContent);
}
