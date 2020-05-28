import isHTMLEmpty from './is-html-empty';

export default function trimEmptiesOffEnd (blocks) {
	const output = blocks.slice();

	while (output.length && isHTMLEmpty(output[output.length - 1])) {
		output.pop();
	}

	return output;
}
