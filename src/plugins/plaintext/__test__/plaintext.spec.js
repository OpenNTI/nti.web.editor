/* eslint-env jest */
import { mount, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

import { create } from '../index';
import SimpleTestEditor from '../../../__test__/utils/simple-editor';
import { getRawFromState } from '../../../__test__/utils';



configure({ adapter: new Adapter() });

describe('plaintext plugin', () => {
	test('should remove styles, block types', () => {
		const rawContent = {
			blocks: [
				{ 
					text: 'test', 
					type: 'unstyled', 
					depth: 0, 
					inlineStyleRanges: [{
						'offset': 0,
						'length': 4,
						'style': 'BOLD'
					}], 
					entityRanges: [] 
				},
				{ text: 'code', type: 'code-block', depth: 0, inlineStyleRanges: [], entityRanges: [] },
			],
			entityMap: {}
		};
		const editor = mount(<SimpleTestEditor plugins={[create()]} rawContent={rawContent} />);
		const draftEditor = editor.state('editor');
		const rawState = getRawFromState(draftEditor.getEditorState());
		expect(rawState.blocks[0].inlineStyleRanges.length).toBe(0);
		expect(rawState.blocks[1].type).toBe('unstyled');
	});
});