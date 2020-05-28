/* eslint-env jest */
import getNodesFromHTML from '../get-nodes-from-html';
import getTagName from '../get-tag-name';


describe('getNodesFromHTML', () => {
	test('simple case', () => {
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

		expect(nodes.length).toBe(3);

		expect(getTagName(nodes[0])).toBe('div');
		expect(nodes[0].textContent).toBe('implicit block 1');

		expect(getTagName(nodes[1])).toBe('p');
		expect(nodes[1].textContent).toBe('paragraph');

		expect(getTagName(nodes[2])).toBe('div');
		expect(nodes[2].textContent).toBe('implicit block 2');
	});

	test('keeps node attributes', () => {
		const nodes = getNodesFromHTML('<p attr="value">Paragraph <a href="test">link</a></p>');

		expect(nodes.length).toBe(1);

		expect(getTagName(nodes[0])).toBe('p');
		expect(nodes[0].getAttribute('attr')).toBe('value');

		const children = Array.from(nodes[0].childNodes);

		expect(children.length).toBe(2);

		expect(getTagName(children[0])).toBe('#text');
		expect(getTagName(children[1])).toBe('a');
		expect(children[1].textContent).toBe('link');
		expect(children[1].getAttribute('href')).toBe('test');
	});

	describe('Whitespace', () => {
		test('collapses whitespace', () => {
			const nodes = getNodesFromHTML('<p>  Test Paragraph \nLine <a href="test"> Link <b>bold</b></a></p>');

			expect(nodes[0].textContent).toBe('Test Paragraph Line Link bold');

			const text = nodes[0].childNodes[0];
			const link = nodes[0].childNodes[1];
			const plainLink = link.childNodes[0];
			const boldLink = link.childNodes[1];

			expect(getTagName(text)).toBe('#text');
			expect(text.textContent).toBe('Test Paragraph Line ');

			expect(getTagName(link)).toBe('a');
			expect(link.textContent).toBe('Link bold');

			expect(getTagName(plainLink)).toBe('#text');
			expect(plainLink.textContent).toBe('Link ');

			expect(getTagName(boldLink)).toBe('b');
			expect(boldLink.textContent).toBe('bold');
		});

		test('Splits pre blocks and preservers whitespace', () => {
			const nodes = getNodesFromHTML(
				`<pre>
  if (code) {
  	preserveWhitespace();
  }
</pre>`
			);

			expect(nodes.length).toBe(4);

			for (let node of nodes) {
				expect(getTagName(node)).toBe('pre');
			}

			expect(nodes[0].textContent).toBe('  if (code) {');
			expect(nodes[1].textContent).toBe('  \tpreserveWhitespace();');
			expect(nodes[2].textContent).toBe('  }');
			expect(nodes[3].textContent).toBe('');
		});
	});

	test('lists', () => {
		const nodes = getNodesFromHTML(
			`
<ul>
	<li>item 1-1</li>
	<li>
		item 1-2
		<ol>
			<li>item 2-1</li>
			<li>item 2-2</li>
		</ol>
	</li>
	<li>item 1-3</li>
</ul>`			
		);

		expect(nodes.length).toBe(5);

		for (let node of nodes) {
			expect(getTagName(node)).toBe('li');
		}

		const isOrderedListItem = (node) => getTagName(node.parentNode) === 'ol';
		const isUnorderedListItem = (node) => getTagName(node.parentNode) === 'ul';

		const getDepth = (node) => parseInt(node.parentNode.getAttribute('data-depth'), 10);

		expect(nodes[0].textContent).toBe('item 1-1');
		expect(isUnorderedListItem(nodes[0])).toBeTruthy();
		expect(getDepth(nodes[0])).toBe(0);

		expect(nodes[1].textContent).toBe('item 1-2\t\t');
		expect(isUnorderedListItem(nodes[1])).toBeTruthy();
		expect(getDepth(nodes[1])).toBe(0);

		expect(nodes[2].textContent).toBe('item 2-1');
		expect(isOrderedListItem(nodes[2])).toBeTruthy();
		expect(getDepth(nodes[2])).toBe(1);
		
		expect(nodes[3].textContent).toBe('item 2-2');
		expect(isOrderedListItem(nodes[3])).toBeTruthy();
		expect(getDepth(nodes[3])).toBe(1);
		
		expect(nodes[4].textContent).toBe('item 1-3');
		expect(isUnorderedListItem(nodes[4])).toBeTruthy();
		expect(getDepth(nodes[4])).toBe(0);
	});
});