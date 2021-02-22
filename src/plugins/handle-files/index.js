import { insertAtomicBlocks } from '../../utils';
import { HANDLED, NOT_HANDLED } from '../Constants';

export const create = config => {
	function getNewEditorState(files, editorState, selection) {
		let newEditorState = null;

		if (config.getAtomicBlockData) {
			newEditorState = insertAtomicBlocks(
				config.getAtomicBlockData(files),
				selection,
				editorState
			);
		}

		return newEditorState;
	}

	return {
		handlePastedFiles(files, { getEditorState, setEditorState }) {
			const editorState = getEditorState();
			const selection = editorState.getSelection();

			const newEditorState = getNewEditorState(
				files,
				editorState,
				selection
			);

			if (newEditorState) {
				setEditorState(newEditorState);
				return HANDLED;
			}

			return NOT_HANDLED;
		},

		handleDroppedFiles(
			selection,
			files,
			{ getEditorState, setEditorState }
		) {
			const editorState = getEditorState();

			const newEditorState = getNewEditorState(
				files,
				editorState,
				selection
			);

			if (newEditorState) {
				setEditorState(newEditorState);
				return HANDLED;
			}

			return NOT_HANDLED;
		},
	};
};
