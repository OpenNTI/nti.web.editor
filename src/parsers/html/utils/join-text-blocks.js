export default function joinTextBlock (output, item, separator = '') {
	const last = output.length - 1;
	const lastItem = output[last];

	if (typeof item === 'string' && typeof lastItem === 'string') {
		output[last] = lastItem + separator + item;
	} else {
		output.push(item);
	}

	return output;
}

export const joinWithSeparator = separator => (output, item) => joinTextBlock(output, item, separator);
