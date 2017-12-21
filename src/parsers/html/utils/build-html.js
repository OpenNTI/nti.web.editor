import {BLOCKS} from '../../../Constants';

const PREPEND_SPACE = {
	[BLOCKS.CODE]: true
};

const NON_SPACE_SPACE = '\uFEFF';

function startsWithNonSpaceSpace (content) {
	if(content && content.length > 0) {
		if(content[0] === NON_SPACE_SPACE) {
			return true;
		}
	}

	return false;
}

export default function buildHTML (block) {
	if (!block.prefix) { return block; }

	// only for matching types and only if the block content does not already begin with U+FEFF, prepend U+FEFF
	const pre = PREPEND_SPACE[block.type] && !startsWithNonSpaceSpace(block.content) ? NON_SPACE_SPACE : '';

	return `${block.prefix}${pre}${block.content}${block.postfix}`;
}
