/* eslint-env jest */
import toDraftState from '../to-draft-state';

describe('Plaintext to DraftState', () => {
	test('Should create unstyled block', ()=> {
		const text = 'here is some plaintext';
		const draft = toDraftState(text);
		const blocks = draft.getCurrentContent().getBlocksAsArray();

		expect(blocks.length).toBe(1);

		const block = blocks[0];

		expect(block.text).toEqual(text);
		expect(block.type).toEqual('unstyled');
	});
});
