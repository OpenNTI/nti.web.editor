import { EditorState, AtomicBlockUtils } from 'draft-js';

import { MUTABILITY } from '../../Constants';

export default function appendAtomicBlock(editorState, data) {
	const withEntity = editorState
		.getCurrentContent()
		.createEntity(
			data.MimeType || 'unknown',
			data.mutabiility || MUTABILITY.IMMUTABLE,
			data
		);

	const entityKey = withEntity.getLastCreatedEntityKey();

	let temp = EditorState.createWithContent(withEntity);
	temp = AtomicBlockUtils.insertAtomicBlock(
		EditorState.moveSelectionToEnd(temp),
		entityKey,
		' '
	);

	return EditorState.createWithContent(temp.getCurrentContent());
}
