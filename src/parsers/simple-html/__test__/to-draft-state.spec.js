/* eslint-env jest */
import toDraftState from '../to-draft-state';
import {BLOCKS, STYLES} from '../../../Constants';

describe('HTML to DraftState', () => {
	test('Headers', () => {
		const headers = ['Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5', 'Header 6'];
		const types = [BLOCKS.HEADER_ONE, BLOCKS.HEADER_TWO, BLOCKS.HEADER_THREE, BLOCKS.HEADER_FOUR, BLOCKS.HEADER_FIVE, BLOCKS.HEADER_SIX];

		const html = headers.map((h, i) => `<h${i + 1}>${h}</h${i + 1}>`).join('\n');

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(6);

		for (let i = 0; i < headers.length; i++) {
			let b = blocks[i];

			expect(b.getText()).toEqual(headers[i]);
			expect(b.getType()).toEqual(types[i]);
		}
	});

	test('Paragraphs', () => {
		const paragraphs = ['paragraph 1', 'paragraph 2', 'paragraph 3'];

		const html = paragraphs.map((h) => `<p>${h}</p>`).join('\n');

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(3);

		for (let i = 0; i < paragraphs.length; i++) {
			let b = blocks[i];

			expect(b.getText()).toEqual(paragraphs[i]);
			expect(b.getType()).toEqual(BLOCKS.UNSTYLED);
		}
	});

	test('Ordered List Items', () => {
		const items = ['item 1', 'item 2', 'item 3'];

		const html = `<ol>${items.map(i => `<li>${i}</li>`).join('\n')}</ol>`;

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(3);

		for (let i = 0; i < items.length; i++) {
			let b = blocks[i];

			expect(b.getText()).toEqual(items[i]);
			expect(b.getType()).toEqual(BLOCKS.ORDERED_LIST_ITEM);
			expect(b.getDepth()).toEqual(0);
		}
	});

	test('Unordered List Item', () => {
		const items = ['item 1', 'item 2', 'item 3'];

		const html = `<ul>${items.map(i => `<li>${i}</li>`).join('\n')}</ul>`;

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(3);

		for (let i = 0; i < items.length; i++) {
			let b = blocks[i];

			expect(b.getText()).toEqual(items[i]);
			expect(b.getType()).toEqual(BLOCKS.UNORDERED_LIST_ITEM);
			expect(b.getDepth()).toEqual(0);
		}
	});

	test('Nested Lists', () => {
		const html = `
<ul>
	<li>item 1</li>
	<li>
		<ol>
			<li>item 1-1</li>
			<li>item 1-2</li>
		</ol>
	</li>
	<li>item 2</li>
</ul>
`;

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(4);

		expect(blocks[0].getType()).toEqual(BLOCKS.UNORDERED_LIST_ITEM);
		expect(blocks[0].getText()).toEqual('item 1');
		expect(blocks[0].getDepth()).toEqual(0);

		expect(blocks[1].getType()).toEqual(BLOCKS.ORDERED_LIST_ITEM);
		expect(blocks[1].getText()).toEqual('item 1-1');
		expect(blocks[1].getDepth()).toEqual(1);

		expect(blocks[2].getType()).toEqual(BLOCKS.ORDERED_LIST_ITEM);
		expect(blocks[2].getText()).toEqual('item 1-2');
		expect(blocks[2].getDepth()).toEqual(1);

		expect(blocks[3].getType()).toEqual(BLOCKS.UNORDERED_LIST_ITEM);
		expect(blocks[3].getText()).toEqual('item 2');
		expect(blocks[3].getDepth()).toEqual(0);
	});

	test('Inline Styles', () => {
		const html = '<p>This is <b>b</b>, <em>i</em>, <u>u</u> tests.';
		const styles = {
			8: STYLES.BOLD,
			11: STYLES.ITALIC,
			14: STYLES.UNDERLINE
		};


		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(1);

		const block = blocks[0];
		const text = block.getText();
		const raw = block.toJS();

		expect(block.getText()).toEqual('This is b, i, u tests.');

		for (let i = 0; i < text.length; i++) {
			let style = styles[i];
			let charList = raw.characterList[i];

			if (style) {
				expect(charList.style.length).toEqual(1);
				expect(charList.style[0]).toEqual(style);
			} else {
				expect(charList.style.length).toEqual(0);
			}
		}

	});

	test('Nested Inline Styles', () => {
		const html = '<p>This is <b>b<u>bu<em>buem</em></u></b> tests</p>';
		const styles = {
			8: [STYLES.BOLD],
			9: [STYLES.BOLD, STYLES.UNDERLINE],
			10: [STYLES.BOLD, STYLES.UNDERLINE],
			11: [STYLES.BOLD, STYLES.UNDERLINE, STYLES.ITALIC],
			12: [STYLES.BOLD, STYLES.UNDERLINE, STYLES.ITALIC],
			13: [STYLES.BOLD, STYLES.UNDERLINE, STYLES.ITALIC],
			14: [STYLES.BOLD, STYLES.UNDERLINE, STYLES.ITALIC]
		};

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(1);

		const block = blocks[0];
		const text = block.getText();
		const raw = block.toJS();

		expect(text).toEqual('This is bbubuem tests');

		for (let i = 0; i < text.length; i++) {
			const style = styles[i];
			const charList = raw.characterList[i];

			if (style) {
				expect(charList.style.length).toEqual(style.length);
				const set = new Set(charList.style);

				for (let s of style) {
					expect(set.has(s)).toBeTruthy();
				}

			} else {
				expect(charList.style.length).toEqual(0);
			}
		}
	});

	test('Code block', () => {
		const html = '<pre><pre>Block 1</pre><pre>Block 2</pre><pre>  Block 3</pre></pre>';

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(3);

		expect(blocks[0].getText()).toEqual('Block 1');
		expect(blocks[1].getText()).toEqual('Block 2');
		expect(blocks[2].getText()).toEqual('  Block 3');
	});

	test('Empty paragraph between two code blocks', () => {
		const html = '<pre>First code block</pre><p>\uFEFF</p><pre>Second code block</pre>';

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(3);

		expect(blocks[0].getText()).toEqual('First code block');
		expect(blocks[1].getText()).toEqual('');
		expect(blocks[2].getText()).toEqual('Second code block');
	});

	test('link', () => {
		const html = '<p>Paragraph with a <a href="www.google.com" data-entity-type="link" data-entity-mutability="mutable" data-entity-username="test">link.</a>';
		const linkStart = 17;
		const linkEnd = 221;

		const editorState = toDraftState(html);
		const content = editorState.getCurrentContent();
		const blocks = content.getBlocksAsArray();

		expect(blocks.length).toEqual(1);

		const block = blocks[0];
		const text = block.getText();
		const raw = block.toJS();
		let entityKey = null;

		expect(text).toEqual('Paragraph with a link.');

		for (let i = 0; i < text.length; i++) {
			const charInfo = raw.characterList[i];

			if (i >= linkStart && i <= linkEnd) {
				if (entityKey === null) {
					expect(charInfo.entity).toBeTruthy();
					entityKey = charInfo.entity;
				} else {
					expect(charInfo.entity).toEqual(entityKey);
				}
			} else {
				expect(charInfo.entity).toBeFalsy();
			}
		}

		const entity = content.getEntity(entityKey);

		expect(entity?.getType()).toBe('link');
		expect(entity?.getMutability()).toBe('mutable');
		expect(entity?.getData()?.username).toBe('test');
	});
});
