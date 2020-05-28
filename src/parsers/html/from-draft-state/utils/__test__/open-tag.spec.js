/* eslint-env jest */
import openTag from '../open-tag';

describe('openTag', () => {
	test('Simple test', () => {
		expect(openTag('div')).toEqual('<div>');
	});
});
