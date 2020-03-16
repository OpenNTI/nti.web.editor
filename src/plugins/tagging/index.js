import React from 'react';

import {ENTITIES} from '../../Constants';
import {HANDLED, NOT_HANDLED} from '../Constants';
import {createStore} from '../Store';

import {createDecoratorStrategy, MaybeTag} from './utils';

export const Mention = ENTITIES.MENTION;
export const HashTag = ENTITIES.TAG;

/**
 * Create a tagging instance.
 *
 * Can be given a single strategy or a list of strategies.
 *
 * @param  {Array|Object}  strategies  how tagging should behave
 * @param  {string} strategies.trigger the character to trigger the start of a tag
 * @param  {string} strategies.type    the type of tag
 * @return {[type]}        [description]
 */
export const create = (strategies) => {
	if (!strategies) { throw new Error('Tagging Plugin must be given a strategy'); }

	if (!Array.isArray(strategies)) {
		strategies = [strategies];
	}

	for (let strat of strategies) {
		if (!strat.trigger) { throw new Error('Tagging Strategies must be given a trigger'); }
		if (!strat.type) { throw new Error('Tagging Strategies must be given a type'); }
	}

	const store = createStore({});

	return {
		handleBeforeInput (chars, editorState, time, {setEditorState}) {
			let newEditorState = editorState;

			for (let strat of strategies) {
				const {editorState: updatedState} = MaybeTag.beforeInput(strat, chars, editorState) || {};

				updatedState
			}

			return NOT_HANDLED;
		},

		handleReturn () {
			debugger;
		},

		decorators: strategies.map((s) => ({
			strategy: createDecoratorStrategy(s),
			component: function TagWrapper (props) {
				debugger;
				return (
					<div>
						Tag
					</div>
				);
			}
		}))
	};
};