/* eslint-env jest */
import { render } from '@testing-library/react';
import React from 'react';

import { create } from '../index';
import SimpleTestEditor from '../../../__test__/utils/simple-editor';
import { getRawFromState } from '../../../__test__/utils';

describe('plaintext plugin', () => {
	test('should remove styles, block types', () => {
		const rawContent = {
			blocks: [
				{
					text: 'test',
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [
						{
							offset: 0,
							length: 4,
							style: 'BOLD',
						},
					],
					entityRanges: [],
				},
				{
					text: 'code',
					type: 'code-block',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
				},
			],
			entityMap: {},
		};
		let editor;
		render(
			<SimpleTestEditor
				ref={x => (editor = x)}
				plugins={[create()]}
				rawContent={rawContent}
			/>
		);
		const draftEditor = editor.state.editor;
		const rawState = getRawFromState(draftEditor.getEditorState());
		expect(rawState.blocks[0].inlineStyleRanges.length).toBe(0);
		expect(rawState.blocks[1].type).toBe('unstyled');
	});
});
