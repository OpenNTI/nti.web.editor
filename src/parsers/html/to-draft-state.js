import {
	convertFromHTML,
	DefaultDraftBlockRenderMap,
	ContentState,
	EditorState,
	ContentBlock,
	CharacterMetadata,
	genKey
} from 'draft-js';
import {List, Repeat} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

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
		.map(b => {
			if(b.type === NTI_PARAGRAPH) {
				return makeParagraphFrom(b);
			}

			if(b.type === BLOCKS.CODE) {
				const lines = b.text && b.text.split('\n');

				return (lines || []).map(line => {
					const characters = CharacterMetadata.create();
					return new ContentBlock({
						type: BLOCKS.CODE,
						key: genKey(),
						text: line,
						characterList: List(Repeat(characters, line.length)),
						depth: 0,
						data: {}
					});
				});
			}

			return b;
		});

	const flattened = [].concat.apply([], blocks);

	const content = ContentState.createFromBlockArray(flattened);

	return EditorState.createWithContent(content);
}
