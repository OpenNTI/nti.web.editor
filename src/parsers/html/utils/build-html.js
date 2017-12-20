import {BLOCKS} from '../../../Constants';

const PREPEND_SPACE = {
	[BLOCKS.CODE]: true
};

export default function buildHTML (block) {
	if (!block.prefix) { return block; }

	const pre = PREPEND_SPACE[block.type] ? ' ' : '';

	return `${block.prefix}${pre}${block.content}${block.postfix}`;
}
