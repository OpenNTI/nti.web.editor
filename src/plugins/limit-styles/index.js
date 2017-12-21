import {RichUtils} from 'draft-js';

import {getAllowedSet, fixStateForAllowed, getAllowedStylesForState} from './utils';

export default {
	create: (config = {}) => {
		//TODO: add block type specific allowed or not
		const {allowed, disallowed, byBlockType = {}} = config;

		const allow = getAllowedSet(allowed, disallowed);

		return {
			onChange (editorState) {
				return fixStateForAllowed(editorState, allowed, byBlockType);
			},

			getContext (getEditorState, setEditorState) {
				return {
					get allowedInlineStyles () {
						return getAllowedStylesForState(getEditorState(), allow, byBlockType);
					},


					get currentInlineStyles () {
						const editorState = getEditorState();

						return editorState.getCurrentInlineStyle();
					},


					toggleInlineStyle (style) {
						const newState = RichUtils.toggleInlineStyle(getEditorState(), style);

						setEditorState(newState, true);
					}
				};
			}
		};
	}
};
