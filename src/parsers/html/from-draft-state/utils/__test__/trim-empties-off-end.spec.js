/* eslint-env jest */
import trimEmptiesOffEnd from '../trim-empties-off-end';

describe('trimEmptiesOffEnd', () => {
	test('Test no trim', () => {
		const blocks = [
			'<div>something</div>',
			'<pre>code</pre>',
			'<p>content</p>',
		];

		const result = trimEmptiesOffEnd(blocks);

		expect(result.length).toBe(3);
	});

	test('Test trim end', () => {
		const blocks = ['<div>something</div>', '<pre>code</pre>', '<p></p>'];

		const result = trimEmptiesOffEnd(blocks);

		expect(result.length).toBe(2);
	});
});
