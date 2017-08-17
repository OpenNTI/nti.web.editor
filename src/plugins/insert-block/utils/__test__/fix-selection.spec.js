/* eslint-env jest */
import {SelectionState} from 'draft-js';

import fixSelection from '../fix-selection';

describe('fixSelection for inserting a block', () => {
	test('Doesn\'t change a collapsed selection', () => {
		const anchorKey = 'test';
		const selection = new SelectionState({
			anchorKey,
			anchorOffset: 0,
			focusKey: anchorKey,
			focusOffset: 0
		});

		expect(fixSelection(null, selection)).toEqual(selection);
	});

	test('Collapses expanded selection to the end', () => {
		const focusKey = 'focus';
		const focusOffset = 10;

		const selection = new SelectionState({
			anchorKey: 'anchor',
			anchorOffset: 0,
			focusKey,
			focusOffset
		});

		const fixed = fixSelection(null, selection);

		expect(fixed).not.toEqual(selection);
		expect(fixed.getAnchorKey()).toEqual(focusKey);
		expect(fixed.getAnchorOffset()).toEqual(focusOffset);
		expect(fixed.getFocusKey()).toEqual(focusKey);
		expect(fixed.getFocusOffset()).toEqual(focusOffset);
	});
});
