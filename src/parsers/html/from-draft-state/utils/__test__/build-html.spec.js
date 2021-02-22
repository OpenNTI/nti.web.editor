/* eslint-env jest */
import { BLOCKS } from '../../../../../Constants';
import buildHTML from '../build-html';

describe('buildHTML', () => {
	test('Empty content block', () => {
		const mockBlock = {
			prefix: '<p>',
			postfix: '</p>',
			content: '',
		};

		const html = buildHTML(mockBlock);

		// expect empty blocks to consist only of non-space whitespace
		expect(html).toEqual('<p>\uFEFF</p>');
	});

	test('Code block', () => {
		const mockBlock = {
			prefix: '<pre>',
			postfix: '</pre>',
			type: BLOCKS.CODE,
			content: 'this is some code',
		};

		const html = buildHTML(mockBlock);

		// expect code blocks to get prepended with non-space whitespace
		expect(html).toEqual('<pre>\uFEFFthis is some code</pre>');
	});

	test('Code block already prepended', () => {
		const mockBlock = {
			prefix: '<pre>',
			postfix: '</pre>',
			type: BLOCKS.CODE,
			content: '\uFEFFthis is some code',
		};

		const html = buildHTML(mockBlock);

		// expect the code block to not be double prepended (only one non-space char should be here)
		expect(html).toEqual('<pre>\uFEFFthis is some code</pre>');
	});

	test('Block with no prepend', () => {
		const mockBlock = {
			prefix: '<h1>',
			postfix: '</h1>',
			type: BLOCKS.HEADER_ONE,
			content: 'this is a header',
		};

		const html = buildHTML(mockBlock);

		// h1 is not a type that gets prepending, so there should be no non-space whitespace char
		expect(html).toEqual('<h1>this is a header</h1>');
	});
});
