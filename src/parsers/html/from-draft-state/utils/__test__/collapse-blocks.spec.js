/* eslint-env jest */
import {BLOCKS} from '../../../../../Constants';
import collapseCodeBlocks from '../collapse-blocks';

describe('collapseCodeBlocks', () => {
	test('Simple test', () => {
		const mockBlocks = [
			{
				type: BLOCKS.CODE,
				content: 'first code block'
			},
			{
				type: BLOCKS.H1,
				content: 'first header'
			},
			{
				type: BLOCKS.CODE,
				content: 'second code block'
			},
			{
				type: BLOCKS.CODE,
				content: 'third code block'
			}
		];

		const collapsed = collapseCodeBlocks(mockBlocks);

		expect(collapsed.length).toEqual(3); // third and fourth blocks collapsed into one

		expect(collapsed[0].content).toEqual('first code block');
		expect(collapsed[1].content).toEqual('first header');
		expect(collapsed[2].content).toMatch(/second code block/);
		expect(collapsed[2].content).toMatch(/third code block/);
	});
});
