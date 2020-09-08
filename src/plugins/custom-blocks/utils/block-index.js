import {BLOCKS} from '../../../Constants';
import {isFocusablePlaceholder} from '../../keep-focusable-target';


export function getIndex (contentBlock, editorState, blockFilter) {
	const blocks = editorState.getCurrentContent().getBlocksAsArray();
	let count = 0;

	for (let block of blocks) {
		if (block === contentBlock) {
			break;
		}

		if (!isFocusablePlaceholder(block) && (!blockFilter || blockFilter(block, editorState))) {
			count += 1;
		}
	}

	return count;
}

//When inserting an atomic block it appears that:
//1.) an empty unstyled block gets added above it.
//2.) an unstyled block with just a return char gets added below it
const isPlaceholder = (block) => isFocusablePlaceholder(block) || (block.getType() === BLOCKS.UNSTYLED && block.getText().trim() === '');

function isFirstNonPlaceholder (contentBlock, blocks) {
	for (let block of blocks) {
		if (isPlaceholder(block)) { continue; }

		return block === contentBlock;
	}
}

export function isFirst (contentBlock, editorState) {
	return isFirstNonPlaceholder(
		contentBlock,
		editorState
			.getCurrentContent()
			.getBlocksAsArray()
	);
}

export function isLast (contentBlock, editorState) {
	return isFirstNonPlaceholder(
		contentBlock,
		editorState
			.getCurrentContent()
			.getBlocksAsArray()
			.reverse()
	);
}
