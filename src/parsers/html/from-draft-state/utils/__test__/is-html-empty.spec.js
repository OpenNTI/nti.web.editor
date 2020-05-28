/* eslint-env jest */
import isHTMLEmpty from '../is-html-empty';

describe('isHTMLEmpty', () => {
	test('Test emptiness', () => {
		expect(isHTMLEmpty('<div/>')).toBe(true);
		expect(isHTMLEmpty('<div>content</div>')).toBe(false);
		expect(isHTMLEmpty('<div><span></span></div>')).toBe(true);
		expect(isHTMLEmpty('<div><span>content</span></div>')).toBe(false);
		expect(isHTMLEmpty('<div>\r</div>')).toBe(true);
		expect(isHTMLEmpty('<div>\n</div>')).toBe(true);
	});
});
