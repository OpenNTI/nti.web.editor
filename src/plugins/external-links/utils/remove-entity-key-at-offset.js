import {RichUtils} from 'draft-js';

import getSelectionForEntityKeyAtOffset from './get-selection-for-entity-key-at-offset';

export default function removeEntityKeyAtOffset (entityKey, offset, editorState) {
	const entitySelection = getSelectionForEntityKeyAtOffset(entityKey, offset, editorState);

	return RichUtils.toggleLink(editorState, entitySelection, null);
}
