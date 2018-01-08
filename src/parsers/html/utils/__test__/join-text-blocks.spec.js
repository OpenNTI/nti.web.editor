/* eslint-env jest */
import joinTextBlocks from '../join-text-blocks';

describe('joinTextBlocks', () => {
	test('Test empty', () => {
		const start = [];

		const firstPass = joinTextBlocks(start, 'abc');
		expect(firstPass).toEqual(['abc']);
	});

	test('Test concat', () => {
		const start = ['abc'];

		const firstPass = joinTextBlocks(start, 'def');
		expect(firstPass).toEqual(['abcdef']);

		const secondPass = joinTextBlocks(firstPass, 'ghi');
		expect(secondPass).toEqual(['abcdefghi']);
	});
});
