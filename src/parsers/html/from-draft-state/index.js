import {
	trimEmptiesOffEnd,
	renderBlock,
	joinTextBlocks,
	collapseBlocks,
	buildHTML,
} from './utils';

/**
 * Convert DraftJS editor state into HTML.
 *
 * @param  {Object} editorState               editor state to convert
 * @param  {Object} strategy                  override the default parser behaviour
 * @param  {Object} strategy.TypeToTag        override the HTML tag used for a block type
 * @param  {string} strategy.OrderedListTag   tag to use to start an ordered list
 * @param  {string} strategy.UnorderedListTag tag to use to start an unordered list
 * @returns {[string]}                         HTML and Atomic block data
 */
export default function fromDraftState(editorState, strategy) {
	const content = editorState.getCurrentContent();

	const blocks = content
		.getBlockMap()
		.map((...args) => renderBlock(editorState, strategy, ...args))
		.toArray();

	const htmlBlocks = collapseBlocks(blocks).map(block => buildHTML(block));

	return trimEmptiesOffEnd(htmlBlocks).reduce(
		(out, item) => joinTextBlocks(out, item),
		[]
	);
}
