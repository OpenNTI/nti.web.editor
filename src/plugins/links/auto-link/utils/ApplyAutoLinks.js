import {EditorState} from 'draft-js';


import {getLinksInBlock} from './GetLinks';
import {applyLinks} from './ApplyLinks';

export function autoLink (editorState, prevHash = {}, config) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	const {content: newContent, hash} = blocks
		.reduce((acc, block) => {
			const key = block.getKey();
			const text = block.getText();

			if (prevHash[key] === text) {
				return {
					content: acc.content,
					hash: {...acc.hash, [key]: text}
				};
			}

			const links = getLinksInBlock(block, config);

			return {
				content: applyLinks(links ?? [], acc.content),
				hash: {...acc.hash, [key]: text}
			};
		}, {content, hash: {}});

	return {
		editorState: newContent === content ?
			editorState :
			EditorState.forceSelection(
				EditorState.push(editorState, newContent),
				editorState.getSelection()
			),
		hash
	};
}
