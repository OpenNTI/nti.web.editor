import { Array as arr } from '@nti/lib-commons';

import { BLOCKS } from '../../../../Constants';

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
	[BLOCKS.UNORDERED_LIST_ITEM]: 'li',
};

const getTagForType = (type, strategy) =>
	strategy?.TypeToTag?.[type] ?? typeMap[type] ?? type;

const getOrderedListTag = strategy => strategy.OrderedListTag ?? 'ol';
const getUnorderedListTag = strategy => strategy.UnorderedListTag ?? 'ul';

export default function getBlockTags(
	block,
	prevBlock,
	nextBlock,
	strategy = {}
) {
	const { type } = block;
	const { type: prevType } = prevBlock || {};
	const { type: nextType } = nextBlock || {};

	const specialSnowFlakes = {
		[BLOCKS.ORDERED_LIST_ITEM]: {
			open: input =>
				prevType !== BLOCKS.ORDERED_LIST_ITEM
					? [getOrderedListTag(strategy), ...input]
					: input,
			close: input =>
				nextType !== BLOCKS.ORDERED_LIST_ITEM
					? [...input, getOrderedListTag(strategy)]
					: input,
		},
		[BLOCKS.UNORDERED_LIST_ITEM]: {
			open: input =>
				prevType !== BLOCKS.UNORDERED_LIST_ITEM
					? [getUnorderedListTag(strategy), ...input]
					: input,
			close: input =>
				nextType !== BLOCKS.UNORDERED_LIST_ITEM
					? [...input, getUnorderedListTag(strategy)]
					: input,
		},
	};

	let prefix = arr.ensure(getTagForType(type, strategy));
	let postfix = arr.ensure(getTagForType(type, strategy));

	const specialSnowFlake =
		strategy?.WrapperTags?.[type] ?? specialSnowFlakes[type];

	if (specialSnowFlake) {
		prefix = specialSnowFlake.open(prefix);
		postfix = specialSnowFlake.close(postfix);
	}

	const tagger = [openTag, closeTag];

	return [prefix, postfix].map((x, i) => x.map(tagger[i]).join(''));
}
