/* eslint-env jest */
import {
	convertFromRaw,
	EditorState
} from 'draft-js';


import fromDraftState from '../from-draft-state';

describe('DraftState to HTML', () => {
	test('Should convert EditorState to NTI-body-content', ()=> {
		const rawContent = {
			blocks: [
				{ text: 'title', type: 'header-one', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'sub-title', type: 'header-two', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'code', type: 'code-block', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'quote', type: 'blockquote', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [ { offset: 0, length: 1, key: 0 } ] },
				{ text: 'closing text', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {
				0: { type: 'some-cool-embed', mutability: 'IMMUTABLE', data: { MimeType: 'some-cool-embed', test: true } }
			}
		};

		const content = convertFromRaw(rawContent);
		const editorState = EditorState.createWithContent(content);

		const value = fromDraftState(editorState);

		expect(value).toEqual([
			[
				'<h1>title</h1>',
				'<h2>sub-title</h2>',
				'<p>paragraph</p>',
				'<ul><li>list-item</li>',
				'<li>list-item</li></ul>',
				'<ol><li>list-item</li>',
				'<li>list-item</li></ol>',
				'<pre>code</pre>',
				'<blockquote>quote</blockquote>'
			].join(''),
			{
				MimeType: 'some-cool-embed',
				test: true
			},
			'<p>closing text</p>'
		]);
	});
});
