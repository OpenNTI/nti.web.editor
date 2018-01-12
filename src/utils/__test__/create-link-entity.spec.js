/* eslint-env jest */
import getDefaultEditorState from '../../__test__/utils/default-editor-state';
import createLinkEntity from '../create-link-entity';
import { BLOCKS } from '../../Constants';

const HREF = '/some/url';

describe('createLinkEntity', () => {
	test('Test createEntity with contiguous=true', () => {
		const editorState = getDefaultEditorState([BLOCKS.UNSTYLED]);
		const contentState = editorState.getCurrentContent();

		const result = createLinkEntity(contentState, '/some/url', true);

		const lastCreatedKey = result.getLastCreatedEntityKey();
		const newEntity = result.getEntity(lastCreatedKey);

		expect(newEntity.data.href).toEqual(HREF);
		expect(newEntity.data.contiguous).toBe(true);
	});

	test('Test createEntity with contiguous=false', () => {
		const editorState = getDefaultEditorState([BLOCKS.UNSTYLED]);
		const contentState = editorState.getCurrentContent();

		const result = createLinkEntity(contentState, '/some/url', false);

		const lastCreatedKey = result.getLastCreatedEntityKey();
		const newEntity = result.getEntity(lastCreatedKey);

		expect(newEntity.data.href).toEqual(HREF);
		expect(newEntity.data.contiguous).toBe(false);
	});
});
