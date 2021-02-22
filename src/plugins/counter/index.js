import React from 'react';

import CharacterCounter from './components/CharacterCounter';
import LimitOverlay from './components/LimitOverlay';
import generateCharacterStrategy from './strategies/character';
import { getCharacterCount, getContextState } from './utils';

export const components = { CharacterCounter };

/**
 * Create a counter plugin
 *
 * @param  {Object} config config for the plugin
 * @param {Object} config.character config for character counter
 * @param {number} config.character.limit the number of characters to allow before showing an over limit state
 * @param {boolean} config.character.countDown count characters down instead of up
 * @returns {[type]}        [description]
 */
export const create = (config = {}) => {
	const { character } = config;

	let decorators = [];

	if (character) {
		decorators.push({
			strategy: generateCharacterStrategy(character),
			component: function CharacterDecorator(props) {
				return <LimitOverlay {...props} />;
			},
		});
	}

	return {
		decorators,

		getContext(getEditorState, setEditorState, focus) {
			const editorState = getEditorState();
			const context = {
				character: getContextState(
					getCharacterCount(editorState),
					character
				),
			};

			return {
				counter: { ...context },
			};
		},
	};
};
