import {Modifier, EditorState} from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import {Map as ImmutableMap} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

import {getRangeForBlock} from '../../../utils';
import {CHANGE_TYPES} from '../../../Constants';

export default function setBlockData (block, data, editorState) {
	const content = editorState.getCurrentContent();
	const selection = getRangeForBlock(block);

	const newContent = Modifier.mergeBlockData(content, selection, new ImmutableMap(data));

	return EditorState.push(editorState, newContent, CHANGE_TYPES.CHANGE_BLOCK_DATA);
}
