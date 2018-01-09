/* eslint-env jest */

import getAllowedSet from '../get-allowed-set';
import { STYLE_SET, STYLES } from '../../../../Constants';

describe('get allowed set', () => {
	test('should return style set', () => {
		const allowedSet = getAllowedSet();
		expect(allowedSet).toEqual(STYLE_SET);
	});

	test('should return allowed set', () => {
		const allowed = new Set([STYLES.BOLD, STYLES.STRIKETHROUGH]);

		const allowedSet = getAllowedSet(allowed);
		expect(allowedSet).toBe(allowed);
	});

	// TODO: Write test that supports disallowed union when logic is written.
});