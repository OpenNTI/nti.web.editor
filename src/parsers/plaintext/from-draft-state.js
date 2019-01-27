import {trimEmptiesOffEnd, joinWithSeparator} from '../html/utils';

export default function fromDraftState (editorState) {
	const content = editorState.getCurrentContent();

	const textBlocks = content.getBlockMap()
		.map((block) => block.getText())
		.toArray();

	const join = joinWithSeparator('\n'); 

	return trimEmptiesOffEnd(textBlocks)
		.reduce(join, []);
}
