import { convertFromRaw, EditorState } from 'draft-js';

export default function getDefaultEditorState(includeTypes) {
	const defaultBlocks = [
		{
			text: 'title',
			type: 'header-one',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'sub-title',
			type: 'header-two',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'paragraph',
			type: 'unstyled',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'list-item',
			type: 'unordered-list-item',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'list-item',
			type: 'unordered-list-item',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'list-item',
			type: 'ordered-list-item',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'list-item',
			type: 'ordered-list-item',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'code',
			type: 'code-block',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: 'quote',
			type: 'blockquote',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
		{
			text: ' ',
			type: 'atomic',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [{ offset: 0, length: 1, key: 0 }],
		},
		{
			text: 'closing text',
			type: 'unstyled',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
	];

	const filteredBlocks = defaultBlocks.filter(block =>
		includeTypes.includes(block.type)
	);

	const rawContent = {
		blocks: includeTypes.length > 0 ? filteredBlocks : defaultBlocks,
		entityMap: {
			0: {
				type: 'some-cool-embed',
				mutability: 'IMMUTABLE',
				data: { MimeType: 'some-cool-embed', test: true },
			},
		},
	};

	const content = convertFromRaw(rawContent);
	const editorState = EditorState.createWithContent(content);

	return editorState;
}
