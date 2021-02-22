/* eslint-env jest */
import { CharacterMetadata } from 'draft-js';
import { List, Repeat } from 'immutable'; //eslint-disable-line import/no-extraneous-dependencies

import normalizeCharacterList from '../normalize-character-list';

describe('normalizeCharacterList', () => {
	test('should normalize', () => {
		const line = 'text';
		const characters = CharacterMetadata.create();
		const characterList = List(Repeat(characters, line.length));
		const normalized = normalizeCharacterList(characterList);

		// TODO: Figure out a more meaningful way to test this.  This is just a placeholder for a real test
		expect(Object.keys(normalized).length).toBe(line.length + 1);
	});
});
