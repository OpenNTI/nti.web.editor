import {
	DefaultDraftBlockRenderMap,
	ContentState,
	Modifier,
	EditorState,
	convertFromHTML,
	getSafeBodyFromHTML
} from 'draft-js';


const BlockRenderMap = DefaultDraftBlockRenderMap
	.set('p', {element: 'p'})
	.set('P', {element: 'P'})
	.set('blockquote', {element: 'blockquote'})
	.set('BLOCKQUOTE', {element: 'BLOCKQUOTE'});

function formatBlocks (blocks, formatTypeChangeMap) {
	return blocks.map(block => {
		const oldType = block.getType();
		const newType = formatTypeChangeMap[oldType];

		return newType ? block.set('type', newType) : block;
	});
}

function getFormatTypeChangeMap (config) {
	const map = config.formatTypeChangeMap || {};

	if (!map['p']) {
		map['p'] = 'unstyled';
	}

	if (!map['P']) {
		map['P'] = 'unstyled';
	}

	if (!map['blockquote']) {
		map['blockquote'] = 'unstyled';
	}

	if (!map['BLOCKQUOTE']) {
		map['BLOCKQUOTE'] = 'unstyled';
	}

	return map;
}

export default {
	shouldFormat (text, html) {
		return !!html;
	},


	format (text, html, editorState, config) {
		const stateFromHTML = convertFromHTML(html, getSafeBodyFromHTML, BlockRenderMap);
		const formatTypeChangeMap = getFormatTypeChangeMap(config);
		const formattedBlocks = formatBlocks(stateFromHTML.contentBlocks, formatTypeChangeMap);

		const fragment = ContentState.createFromBlockArray(formattedBlocks);

		const pastedState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment.blockMap);
		const newState = config.transformHTMLState ? config.transformHTMLState(pastedState) : pastedState;

		return EditorState.push(editorState, newState, 'insert-fragment');
	}
};
