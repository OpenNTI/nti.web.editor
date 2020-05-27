/* eslint-env jest */
import getNodesFromHTML from '../get-nodes-from-html';
import getTagName from '../get-tag-name';


describe('getNodesFromHTML', () => {
	xtest('simple case', () => {
		const nodes = getNodesFromHTML(`
			<h1>Header</h1>
			<h2>SubHeader</h2>
			<p>Test</p>
		`);

		expect(nodes.length).toBe(3);

		expect(getTagName(nodes[0])).toBe('h1');
		expect(nodes[0].textContent).toBe('Header');

		expect(getTagName(nodes[1])).toBe('h2');
		expect(nodes[1].textContent).toBe('SubHeader');

		expect(getTagName(nodes[2])).toBe('p');
		expect(nodes[2].textContent).toBe('Test');
	});

	test('implicit blocks', () => {
		const nodes = getNodesFromHTML(`
			implicit block 1
<p>paragraph</p>
implicit block 2
`
		);

		console.log('GOT: ', nodes.map(x => x.textContent));

		expect(nodes.length).toBe(3);

		expect(getTagName(nodes[0])).toBe('div');
		expect(nodes[0].textContent).toBe('implicit block 1\n');

		expect(getTagName(nodes[1])).toBe('p');
		expect(nodes[1].textContent).toBe('paragraph');

		expect(getTagName(nodes[2])).toBe('div');
		expect(nodes[2].textContent).toBe('implicit block 2\n');
	});
});