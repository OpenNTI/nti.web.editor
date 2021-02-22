/* eslint-env jest */

import getAllowedSet from '../get-allowed-set';
import { BLOCK_SET, BLOCKS } from '../../../../Constants';

describe('get allowed set', () => {
	test('should return block set', () => {
		const allowedSet = getAllowedSet();
		expect(allowedSet).toEqual(BLOCK_SET);
	});

	test('should return allowed set', () => {
		const allowed = new Set([BLOCKS.CODE, BLOCKS.UNSTYLED, BLOCKS.ATOMIC]);

		const allowedSet = getAllowedSet(allowed);
		expect(allowedSet).toBe(allowed);
	});

	// TODO: Write test that supports disallowed union when logic is written.
});
