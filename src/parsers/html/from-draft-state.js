import {trimEmptiesOffEnd, renderBlock, joinTextBlocks} from './utils';

export default function fromDraftState (editorState) {
	const content = editorState.getCurrentContent();

	const htmlBlocks = content.getBlockMap()
		.map((...args) => renderBlock(editorState, ...args))
		.toArray();

	return trimEmptiesOffEnd(htmlBlocks)
		.reduce(joinTextBlocks, []);
}
