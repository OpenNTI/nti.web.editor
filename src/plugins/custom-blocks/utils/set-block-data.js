import { Modifier, EditorState, ContentState } from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import { Map as ImmutableMap } from 'immutable'; //eslint-disable-line import/no-extraneous-dependencies

import { getRangeForBlock } from '../../../utils';
import { CHANGE_TYPES } from '../../../Constants';

export default function setBlockData(block, data, useEntity, editorState) {
	const content = editorState.getCurrentContent();
	const selection = getRangeForBlock(block);

	let newContent = null;

	if (useEntity) {
		const entity = block.getEntityAt(0);

		newContent = content.mergeEntityData(entity, data);
		newContent = ContentState.createFromBlockArray(
			newContent.getBlocksAsArray(),
			newContent.getEntityMap()
		);
	} else {
		newContent = Modifier.mergeBlockData(
			content,
			selection,
			new ImmutableMap(data)
		);
	}

	return EditorState.push(
		editorState,
		newContent,
		CHANGE_TYPES.CHANGE_BLOCK_DATA
	);
}
