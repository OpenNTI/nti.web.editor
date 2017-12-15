import {trimEmptiesOffEnd, joinTextBlocks} from '../html/utils';

export default function fromDraftState (editorState) {
	const content = editorState.getCurrentContent();

	const textBlocks = content.getBlockMap()
		.map((block) => block.getText())
		.toArray();

	return trimEmptiesOffEnd(textBlocks)
		.reduce(joinTextBlocks, []);
}
