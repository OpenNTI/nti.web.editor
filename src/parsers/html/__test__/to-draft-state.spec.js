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
		}
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
});
