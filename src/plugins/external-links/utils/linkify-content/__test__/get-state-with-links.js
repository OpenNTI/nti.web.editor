import { convertFromRaw, EditorState } from 'draft-js';

export default function getStateWithLinks() {
	const prefix = 'visit my site ';
	const url = 'http://www.38footdart.com';
	const suffix = ' to see the dart distance record';

	const defaultBlocks = [
		{
			text: prefix + url + suffix,
			type: 'unstyled',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
	];

	const rawContent = {
		blocks: defaultBlocks,
		entityMap: {},
	};

	const content = convertFromRaw(rawContent);
	return EditorState.createWithContent(content);
}
