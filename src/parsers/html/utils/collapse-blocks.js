import {BLOCKS} from '../../../Constants';

const COLLAPSE_TYPES = {
	[BLOCKS.CODE]: true
};

export default function collapseCodeBlocks (htmlBlocks) {
	return htmlBlocks.reduce((acc, block) => {
		const last = acc[acc.length - 1];

		//If we don't have a block or the current block doesn't collapse or the last block was a different type
		if (!last || !COLLAPSE_TYPES[block.type] || last.type !== block.type) {
			return [...acc, block];
		}

		last.content = `${last.content}\n${block.content}`;
		return acc;
	}, []);
}
