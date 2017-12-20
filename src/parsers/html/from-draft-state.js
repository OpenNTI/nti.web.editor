import {trimEmptiesOffEnd, renderBlock, joinTextBlocks, collapseBlocks, buildHTML} from './utils';

export default function fromDraftState (editorState) {
	const content = editorState.getCurrentContent();

	const blocks = content.getBlockMap()
		.map((...args) => renderBlock(editorState, ...args))
		.toArray();

	const htmlBlocks = collapseBlocks(blocks).map(block => buildHTML(block));


	return trimEmptiesOffEnd(htmlBlocks)
		.reduce(joinTextBlocks, []);
}
