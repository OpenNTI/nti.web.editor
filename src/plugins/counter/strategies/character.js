import { getCharacterCount } from '../utils';

export default function generateCharacterStrategy(characterConfig) {
	const { limit } = characterConfig || {};

	return limit == null
		? () => {}
		: (contentBlock, callback, contentState) => {
				let prevLength = 0;
				let key = contentBlock.getKey();
				let block = contentState.getBlockBefore(key);

				while (block) {
					prevLength += getCharacterCount(block);

					key = block.getKey();
					block = contentState.getBlockBefore(key);
				}

				const remaining = limit - prevLength;
				const length = contentBlock.getLength();

				//if there are no characters remaining the whole block is over the limit
				if (remaining <= 0) {
					return callback(0, length);
				}

				if (remaining < length) {
					return callback(remaining, length);
				}
		  };
}
