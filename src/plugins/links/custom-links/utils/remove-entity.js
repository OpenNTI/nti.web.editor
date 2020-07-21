import {RichUtils} from 'draft-js';

import {getSelectionForEntity} from '../../link-utils';

export default function removeEntity (entityKey, offsetKey, editorState) {
	debugger;
	const entitySelection = getSelectionForEntity(entityKey, offsetKey, editorState);

	return RichUtils.toggleLink(editorState, entitySelection, null);
}