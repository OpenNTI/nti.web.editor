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
const BLANK_P_PLACEHOLDER = '_nti-blank-paragraph_1515431074979';

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
	if (!html || html.length === 0) { return EditorState.createEmpty(); }

	if (Array.isArray(html) && html.every(x => typeof x === 'string')) {
		html = html.join('\n');
	}

	if (typeof html !== 'string') {
		throw new TypeError('Invalid Argument, toDraftState() does not support mixed/model-body input.');
	}

	// a bit ugly but draft will drop the empty <p> tag, which can leave two separate code blocks
	// adjacent to each other, which then merges them as one.  to get around that, inject a placeholder
	// before using draft's converter, then strip out the placeholder after conversion
	const modifiedHTML = html.replace(/<p>\uFEFF<\/p>/g, '<p>' + BLANK_P_PLACEHOLDER + '</p>');

	const blocks = convertFromHTML(modifiedHTML, void 0, BlockRenderMapWithParagraph)
		.contentBlocks
		.map(b => {
			// strip placeholder text
			if(b.text === BLANK_P_PLACEHOLDER) {
				return new ContentBlock({
					type: BLOCKS.UNSTYLED,
					key: b.key,
					text: '',
					characterList: List(),
					depth: 0,
					data: b.data
				});
			}

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
