import {EditorState, Modifier, Entity} from 'draft-js';

import {MUTABILITY} from '../../../Constants';

export default function getStateForInput (input, editorState) {
	const selection = editorState.getSelection();
	const startOffset = selection.getStartOffset();

	//There are no entities to escape if the selection is not collapsed
	//or we are at the start of a block
	if (!selection.isCollapsed() || startOffset === 0) { return; }

	const content = editorState.getCurrentContent();
	const block = content.getBlockForKey(selection.getStartKey());

	const entityKeyBefore = block.getEntityAt(startOffset - 1);
	const entityKeyAfter = block.getEntityAt(startOffset);

	//if there is no entity before or we are in the middle of an entity, there's nothing to do
	if (!entityKeyBefore || entityKeyBefore === entityKeyAfter) { return; }

	const entity = Entity.get(entityKeyBefore);
	const {contiguous = true} = entity.getData();

	//If the entity isn't mutable or it is contiguous there is nothing to do
	if (entity.getMutability() !== MUTABILITY.MUTABLE || contiguous) { return; }

	const newContent = Modifier.insertText(content, selection, input, editorState.getCurrentInlineStyle(), null);

	return EditorState.push(editorState, newContent, 'insert-characters');
}

// insert the text into the contentState
// contentState = Modifier.insertText(
//     contentState,
//     selectionState,
//     char,
//     editorState.getCurrentInlineStyle(),
//     null
// )
// // push the new content into the editor state
// const newEditorState = EditorState.push(
//     editorState,
//     contentState,
//     "insert-characters"
// )
// return newEditorState
