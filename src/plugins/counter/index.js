import CharacterCounter from './components/CharacterCounter';
import {getCharacterCount, getContextState} from './utils';


export const components = {CharacterCounter};

/**
 * Create a counter plugin
 *
 * @param  {Object} config config for the plugin
 * @param {Object} config.character config for character counter
 * @param {Number} config.character.limit the number of characters to allow before showing an over limit state
 * @param {Boolean} config.character.countDown count characters down instead of up
 * @return {[type]}        [description]
 */
export const create = (config = {}) => {
	const {character} = config;

	// const decorators = limit ?
	// 	[
	// 		{
	// 			strategy,
	// 			component: function () {}
	// 		}
	// 	]

	return {
		// decorators

		getContext (getEditorState, setEditorState, focus) {
			const editorState = getEditorState();
			const context = {
				character: getContextState(getCharacterCount(editorState), character)
			};

			return {
				counter: {...context}
			};
		}
	};
};
