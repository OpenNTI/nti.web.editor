/* eslint-env jest */
import getFullHref from '../get-full-href';

describe('getFullHref', () => {
	test('adds protocol if none', () => {
		expect(getFullHref('www.google.com')).toEqual('http://www.google.com');
	});

	test('does nothing if there is a protocol', () => {
		expect(getFullHref('http://www.google.com')).toEqual('http://www.google.com');
	});
});
