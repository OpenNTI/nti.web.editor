import React from 'react';
import {wait} from '@nti/lib-commons';


import {ENTITIES} from '../../Constants';
import {HANDLED, NOT_HANDLED} from '../Constants';
import {createStore, getEventFor} from '../Store';

import {createDecoratorStrategy, MaybeTag} from './utils';
import TaggingStrategy from './TaggingStrategy';
import Tag from './components/Tag';

export const Mention = ENTITIES.MENTION;
export const HashTag = ENTITIES.TAG;

export const BuildStrategy = (...args) => new TaggingStrategy(...args);

const SelectionKey = 'selection';
const SelectionKeyEvent = getEventFor(SelectionKey);

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

	for (let i = 0; i < strategies.length; i++) {
		const strat = strategies[0];

		if (!(strat instanceof TaggingStrategy)) { throw new Error('Tagging Strategies must be built using BuildStrategy.'); }

		strat.index = i;
	}

	const store = createStore({});
	let handled = false;
	let lastEditorState = null;

	let updatedSelectionTimeout = null;

	function maybeUpdateSelection (editorState) {
		const oldSelection = store.getItem(SelectionKey);
		const selection = editorState.getSelection();

		if (oldSelection !== selection) {
			clearTimeout(updatedSelectionTimeout);
			updatedSelectionTimeout = setTimeout(() => {
				store.setItem(SelectionKey, selection);
			}, 0);
		}
	}

	function subscribeToSelection (fn) {
		const listeners = {
			[SelectionKeyEvent]: fn
		};

		store.addListeners(listeners);

		return () => {
			store.removeListeners(listeners);
		};
	}

	return {
		onChange (editorState) {

			const oldEditorState = lastEditorState;
			lastEditorState = editorState;

			//If we already handled the change
			if (handled) {
				handled = false;
				maybeUpdateSelection(editorState);
				return editorState;
			}

			//If the content hasn't changed from the last change
			if (oldEditorState && editorState.getCurrentContent() === oldEditorState.getCurrentContent()) {
				maybeUpdateSelection(editorState);
				return editorState;
			}

			const updatedEditorState = MaybeTag.onChange(strategies, editorState);

			maybeUpdateSelection(updatedEditorState || editorState);
			return updatedEditorState || editorState;
		},


		handleBeforeInput (chars, editorState, time, {setEditorState}) {
			const newEditorState = MaybeTag.beforeInput(strategies, chars, editorState);

			handled = true;

			if (newEditorState) {
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
				return (
					<Tag strategy={s} store={store} subscribeToSelection={subscribeToSelection} {...props}>
						{props.children}
					</Tag>
				);
			}
		}))
	};
};