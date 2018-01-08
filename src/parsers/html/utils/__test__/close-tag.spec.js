/* eslint-env jest */
import closeTag from '../close-tag';

describe('closeTag', () => {
	test('Simple test', () => {
		expect(closeTag('div')).toEqual('</div>');
	});
});
