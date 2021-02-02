import {FocusableTargets} from './utils';

export const isFocusablePlaceholder = FocusableTargets.isPlaceholderFocusableTarget;

/**
 * Through editing it is possible to remove any
 * @returns {Object} draft-js editor plugin
 */
export const create = () => {
	return {
		onChange (editorState) {
			return FocusableTargets.add(editorState);
		},

		transformOutput (editorState) {
			return editorState ? FocusableTargets.remove(editorState) : editorState;
		},

		transformInput (editorState) {
			return editorState ? FocusableTargets.add(editorState) : editorState;
		}
	};
};
