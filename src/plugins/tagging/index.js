import React from 'react';

import {ENTITIES} from '../../Constants';
import {HANDLED, NOT_HANDLED} from '../Constants';
import {createStore, getEventFor} from '../Store';

import {createDecoratorStrategy, MaybeTag, getAllTags as getAllTagsUtil} from './utils';
import TaggingStrategy from './TaggingStrategy';
import Tag from './components/Tag';

export const Mention = ENTITIES.MENTION;
export const HashTag = ENTITIES.TAG;

export const BuildStrategy = (...args) => new TaggingStrategy(...args);

export const getAllTags = getAllTagsUtil;

const SelectionKey = 'selection';
const SelectionKeyEvent = getEventFor(SelectionKey);

const FocusedKey = 'has-focus';
const FocusedEvent = getEventFor(FocusedKey);

const throwIfNotTaggingStategy = x => {
	if (!(x instanceof TaggingStrategy)) { throw new Error('Tagging Stategies must be build using BuildStrategy.'); }
};
function setupStrategies (strategies) {
	if (!strategies) { throw new Error('Tagging Plugin must be given a strategy'); }
	
	if (typeof strategies === 'object') {
		return Object.entries(strategies)
			.map(([key, strat]) => {
				throwIfNotTaggingStategy(strat);
				strat.key = key;
				return strat;
			});
	}

	if (!Array.isArray(strategies)) {
		strategies = [strategies];
	}

	return strategies
		.map((strat, key) => {
			throwIfNotTaggingStategy(strat);
			strat.key = key;
			return strat;
		});
}

/**
 * Create a tagging instance.
 *
 * Can be given a single strategy or a list of strategies.
 *
 * @param  {Array|Object}  config  how tagging should behave
 * @param  {string} strategies.trigger the character to trigger the start of a tag
 * @param  {string} strategies.type    the type of tag
 * @return {[type]}        [description]
 */
export const create = (config) => {
	const strategies = setupStrategies(config);

	const store = createStore({});
	
	let blurTimeout = null;
	let handled = false;
	let lastEditorState = null;

	let updatedSelectionTimeout = null;

	function maybeUpdateSelection (editorState) {
		const oldSelection = store.getItem(SelectionKey);
		const selection = editorState?.getSelection();

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

	function subscribeToFocused (fn) {
		const listeners = {
			[FocusedEvent]: fn
		};

		fn(store.getItem(FocusedKey));

		store.addListeners(listeners);

		return () => {
			store.removeListeners(listeners);
		};
	}

	return {
		onFocus () {
			clearTimeout(blurTimeout);
			store.setItem(FocusedKey, true);
		},

		onBlur () {
			blurTimeout = setTimeout(() => {
				store.setItem(FocusedKey, false);
			}, 10);
		},

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


		decorators: strategies.map((s) => ({
			strategy: createDecoratorStrategy(s),
			component: function TagWrapper (props) {
				return (
					<Tag
						strategy={s}
						store={store}
						subscribeToSelection={subscribeToSelection}
						subscribeToFocused={subscribeToFocused}
						{...props}
					>
						{props.children}
					</Tag>
				);
			}
		}))
	};
};