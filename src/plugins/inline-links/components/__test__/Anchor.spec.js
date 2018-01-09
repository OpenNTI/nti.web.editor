/* eslint-env jest */
import { shallow } from 'enzyme';
import React from 'react';

import { getEditorState } from '../../../../__test__/utils';
import Anchor from '../Anchor';

describe('Anchor Component', () => {
	test('should href is correct value', () => {
		const editorState = getEditorState({
			entityMap: {
				'0': {
					'type': 'LINK',
					'mutability': 'MUTABLE',
					'data': {
						'href': 'https://nextthought.com/',
						'contiguous': false
					}
				}
			}, blocks: [
				{
					'key': '5knpu',
					'text': 'test',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [],
					'entityRanges': [],
					'data': {}
				},
				{
					'key': '26fri',
					'text': 'nextthought',
					'type': 'unstyled',
					'depth': 0,
					'inlineStyleRanges': [],
					'entityRanges': [
						{
							'offset': 0,
							'length': 11,
							'key': 0
						}
					],
					'data': {}
				}
			]
		});
		const wrapper = shallow(<Anchor contentState={editorState.getCurrentContent()} entityKey={'1'}>nextthought</Anchor>);
		expect(wrapper.prop('href')).toBe('https://nextthought.com/');
		expect(wrapper.text()).toBe('nextthought');
	});
});