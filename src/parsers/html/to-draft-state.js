import {
	convertFromHTML,
	DefaultDraftBlockRenderMap,
	ContentState,
	EditorState,
	ContentBlock
} from 'draft-js';

import {BLOCKS} from '../../Constants';

const NTI_PARAGRAPH = 'nti-paragraph';

/**
 * Draft will merge consecutive paragraphs together, which leads
 * to weird formatting. To prevent that we substitute our own
 * block for p tags, then replace them with unstyled after its parsed.
 * @type {DraftBlockRenderMap}
 */
const BlockRenderMapWithParagraph = DefaultDraftBlockRenderMap
	.set(NTI_PARAGRAPH, {element: 'p'})
	.set(NTI_PARAGRAPH, {element: 'P'});

function makeParagraphFrom (b) {
	return new ContentBlock({
		type: BLOCKS.UNSTYLED,
		key: b.key,
		text: b.text,
		characterList: b.characterList,
		depth: b.depth,
		data: b.data
	});
}

export default function toDraftState (html) {
	if (!html) { return EditorState.createEmpty(); }

	const blocks = convertFromHTML(html, void 0, BlockRenderMapWithParagraph)
		.contentBlocks
		.map(b => b.type === NTI_PARAGRAPH ? makeParagraphFrom(b) : b);

	const content = ContentState.createFromBlockArray(blocks);

	return EditorState.createWithContent(content);
}
