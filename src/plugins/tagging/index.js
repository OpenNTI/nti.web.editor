import React from 'react';

import {ENTITIES, BLOCK_SET} from '../../Constants';
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

		if (!strat.allowedInBlockTypes) {
			strat.allowedInBlockTypes = BLOCK_SET;
		}

		strat.contiguous = strat.contiguous ?? true;
	}

	const store = createStore({});
	let handled = false;
	let lastEditorState = null;

	return {
		onChange (editorState) {
			const oldEditorState = lastEditorState;
			lastEditorState = editorState;

			//If we already handled the change
			if (handled) {
				handled = false;
				return editorState;
			}

			//If the content hasn't changed from the last change
			if (oldEditorState && editorState.getCurrentContent() === oldEditorState.getCurrentContent()) {
				return editorState;
			}


			const updatedEditorState = MaybeTag.onChange(strategies, editorState);

			return updatedEditorState || editorState;
		},


		handleBeforeInput (chars, editorState, time, {setEditorState}) {
			const newEditorState = MaybeTag.beforeInput(strategies, chars, editorState);

			handled = true;

			if (newEditorState) {
				console.log('NEW TAG!: ', newEditorState.getCurrentContent().toJS());
				setEditorState(newEditorState);
				return HANDLED;
			}

			return NOT_HANDLED;
		},


		handleReturn () {
			console.log('TAGGING RETURN');
		},

		decorators: strategies.map((s) => ({
			strategy: createDecoratorStrategy(s),
			component: function TagWrapper (props) {
				debugger;
				return (
					<span style={{color: 'blue'}}>
						{props.children}
					</span>
				);
			}
		}))
	};
};