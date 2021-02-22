import getPlainText from './get-plain-text';
import decodeUnicode from './decode-unicode';

const NEW_LINE_REGEX = /(?:\r\n|\r|\n)/g; //new line, carriage return, line feed

/**
 * Given an editorState return the character count.
 * Taken from: https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-counter-plugin
 *
 * @param  {Object} editorStateOrBlock the editorState or block to get the character count from
 * @returns {number}             the number of characters in the editorState
 */
export default function getCharacterCount(editorStateOrBlock) {
	const text = getPlainText(editorStateOrBlock, '');
	const cleanText = text.replace(NEW_LINE_REGEX, '');

	return decodeUnicode(cleanText).length;
}
