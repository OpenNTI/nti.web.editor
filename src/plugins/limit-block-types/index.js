import {RichUtils} from 'draft-js';

import {getAllowedSet, getCurrentBlockType, fixStateForAllowed} from './utils';

export default {
	create: (config = {}) => {
		const {allow, disallow, defaultType} = config;

		const allowed = getAllowedSet(allow, disallow);

		return {
			onChange (editorState) {
				return fixStateForAllowed(editorState, allowed, defaultType);
			},


			getContext (getEditorState, setEditorState) {
				return {
					get allowedBlockTypes () {
						return allowed;
					},

					get currentBlockType () {
						return getCurrentBlockType(getEditorState());
					},

					toggleBlockType (type) {
						const editorState = getEditorState();
						const newState = RichUtils.toggleBlockType(editorState, type);

						setEditorState(newState, true);
					}
				};
			},
		};
	}
};
