/* eslint-env jest */
import { convertFromRaw, EditorState } from 'draft-js';

import singleLinePlugin from '../index';
import { HANDLED } from '../../Constants';

describe('singleLinePlugin', () => {
	const plugin = singleLinePlugin.create();

	const rawContent = {
		blocks: [
			{
				text: 'paragraph',
				type: 'unstyled',
				depth: 0,
				inlineStyleRanges: [],
				entityRanges: [],
			},
		],
		entityMap: {},
	};

	const content = convertFromRaw(rawContent);
	const editorState = EditorState.createWithContent(content);

	test('Test text paste handler', () => {
		let newState;
		const result = plugin.handlePastedText(
			void 0,
			'<p>some html</p>',
			editorState,
			{
				setEditorState: val => {
					newState = val;
				},
			}
		);

		const blocks = newState.getCurrentContent().getBlocksAsArray();

		expect(blocks.length).toEqual(1);

		// original paragraph plus a new <p> element should still be one block with the combined text
		expect(blocks[0].text).toEqual('some htmlparagraph');

		expect(result).toEqual(HANDLED);
	});

	test('Test html paste handler', () => {
		let newState;
		const result = plugin.handlePastedText(
			'some text',
			void 0,
			editorState,
			{
				setEditorState: val => {
					newState = val;
				},
			}
		);

		const blocks = newState.getCurrentContent().getBlocksAsArray();

		expect(blocks.length).toEqual(1);

		// original text plus a new <p> element should still be one block with the combined text
		expect(blocks[0].text).toEqual('some textparagraph');

		expect(result).toEqual(HANDLED);
	});

	test('Test return handler', () => {
		const result = plugin.handleReturn();

		// handleReturn shouldn't do anything but tell us that the return event was handled
		expect(result).toEqual(HANDLED);
	});
});
