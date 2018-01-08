/* eslint-env jest */
import escapeHTML from '../escape-html';

describe('escapeHTML', () => {
	test('No changes', () => {
		const raw = 'this is simple html';

		expect(escapeHTML(raw)).toEqual(raw);
	});

	test('Escaped', () => {
		const raw = 'this is < more > complex & html';

		expect(escapeHTML(raw)).toEqual('this is &lt; more &gt; complex &amp; html');
	});
});
