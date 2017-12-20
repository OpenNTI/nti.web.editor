import {BLOCKS} from '../../../Constants';

import openTag from './open-tag';
import closeTag from './close-tag';

const typeMap = {
	[BLOCKS.UNSTYLED]: 'p',
	[BLOCKS.HEADER_ONE]: 'h1',
	[BLOCKS.HEADER_TWO]: 'h2',
	[BLOCKS.HEADER_THREE]: 'h3',
	[BLOCKS.HEADER_FOUR]: 'h4',
	[BLOCKS.HEADER_FIVE]: 'h5',
	[BLOCKS.HEADER_SIX]: 'h6',
	[BLOCKS.CODE]: 'pre',
	[BLOCKS.BLOCKQUOTE]: 'blockquote',
	[BLOCKS.ORDERED_LIST_ITEM]: 'li',
	[BLOCKS.UNORDERED_LIST_ITEM]: 'li'
};

export default function getBlockTags (block, prevBlock, nextBlock) {
	const {type} = block;
	const {type:prevType} = prevBlock || {};
	const {type:nextType} = nextBlock || {};

	const specialSnowFlakes = {
		[BLOCKS.ORDERED_LIST_ITEM]: {
			open: input => prevType !== BLOCKS.ORDERED_LIST_ITEM ? ['ol', ...input] : input,
			close: input => nextType !== BLOCKS.ORDERED_LIST_ITEM ? [...input, 'ol'] : input
		},
		[BLOCKS.UNORDERED_LIST_ITEM]: {
			open: input => prevType !== BLOCKS.UNORDERED_LIST_ITEM ? ['ul', ...input] : input,
			close: input => nextType !== BLOCKS.UNORDERED_LIST_ITEM ? [...input, 'ul'] : input
		}
	};

	let prefix = [typeMap[type] || type];
	let postfix = [typeMap[type] || type];

	const specialSnowFlake = specialSnowFlakes[type];

	if (specialSnowFlake) {
		prefix = specialSnowFlake.open(prefix);
		postfix = specialSnowFlake.close(postfix);
	}

	const tagger = [openTag, closeTag];

	return [prefix, postfix].map((x, i) => x.map(tagger[i]).join(''));
}
