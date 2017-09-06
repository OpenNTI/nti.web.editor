export default function joinTextBlock (output, item) {
	const last = output.length - 1;
	const lastItem = output[last];

	if (typeof item === 'string' && typeof lastItem === 'string') {
		output[last] = lastItem + item;
	} else {
		output.push(item);
	}

	return output;
}
