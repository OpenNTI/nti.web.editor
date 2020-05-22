// import {EditorState} from 'draft-js';
// import {convertFromHTML} from 'draft-convert';

// import {getEmptyState} from '../utils';

// export default function toDraftState (html) {
// 	if (!html || (Array.isArray(html) && html.length === 0)) { return getEmptyState(); }

// 	const converted = convertFromHTML(html);

// 	console.log(converted.getBlocksAsArray().map(x => x.toJS()));

// 	return EditorState.createWithContent(converted);
// }

import {
	convertFromHTML,
	EditorState,
	DefaultDraftBlockRenderMap,
	ContentBlock,
	CharacterMetadata,
	genKey
} from 'draft-js';
import {List, Repeat} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

import {BLOCKS} from '../../Constants';
import {getEmptyState, getStateForBlocks, appendAtomicBlock} from '../utils';

const NTI_CODE = 'nti-code';
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

function getBlocksForHTML (html) {
	if (!html || html.length === 0) { return ; }

	// a bit ugly but draft will drop the empty <p> tag, which can leave two separate code blocks
	// adjacent to each other, which then merges them as one.  to get around that, inject a placeholder
	// before using draft's converter, then strip out the placeholder after conversion
	const modifiedHTML = html.replace(/<p>\uFEFF<\/p>/g, '<p>' + BLANK_P_PLACEHOLDER + '</p>');

	const blocks = convertFromHTML(modifiedHTML, void 0, BlockRenderMapWithParagraph)
		.contentBlocks
		.map(b => {
			// strip placeholder text
			if (b.text === BLANK_P_PLACEHOLDER) {
				return new ContentBlock({
					type: BLOCKS.UNSTYLED,
					key: b.key,
					text: '',
					characterList: List(),
					depth: 0,
					data: b.data
				});
			}

			if (b.type === NTI_PARAGRAPH) {
				return makeParagraphFrom(b);
			}

			if (b.type === NTI_CODE) {
				console.log('NTI CODE: ', b.text);
			}

			if (b.type === BLOCKS.CODE || b.type === NTI_CODE) {
				const lines = b.text && b.text.split('\n');
				console.log('CODE BLOCKS: ', lines, b.type);

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

	return blocks.flat();
}

export default function toDraftState (html) {
	if (!html || html.length === 0) { return getEmptyState(); }
	if (html instanceof EditorState) { return html; }

	if (!Array.isArray(html)) { html = [html]; }

	let editorState = null;
	let lastBlockWasAtomic = false;

	console.log('INITIAL HTML: ', html);
	for (let part of html) {
		if (typeof part === 'string') {
			const existingBlocks = editorState ? editorState.getCurrentContent().getBlocksAsArray() : [];
			const blocks = getBlocksForHTML(part);
			console.log('BLOCKS: ', blocks);
			// Inserting atomic blocks also inserts a blank text block after it...
			// if we encounter that block, drop it because we have text here (and we
			// don't want to add additional lines when we don't have to)
			const lastBlock = existingBlocks[existingBlocks.length - 1];
			if (lastBlockWasAtomic && lastBlock?.getText() === '' && lastBlock?.type === BLOCKS.UNSTYLED) {
				existingBlocks.pop();
			}

			lastBlockWasAtomic = false;
			editorState = getStateForBlocks([
				...existingBlocks,
				...blocks
			]);
		} else {
			lastBlockWasAtomic = true;
			editorState = appendAtomicBlock(editorState || getEmptyState(), part);
		}
	}

	return editorState;
}
