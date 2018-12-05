import React from 'react';
import {RichUtils} from 'draft-js';
import {wait} from '@nti/lib-commons';

import {HANDLED, NOT_HANDLED} from '../Constants';
import {createStore} from '../Store';

import Link from './components/Link';
import Overlay from './components/Overlay';
import {SelectedEntityKey, EditingEntityKey} from './Constants';
import strategy from './strategy';
import {
	getSelectedEntityKey,
	createEntity,
	getFirstSelectedEntityHref,
	isValidSelectionForLink,
	fixStateForAllowed,
	linkifyContent
} from './utils';


export default {
	create: (config = {}) => {
		const {
			allowedInBlockTypes,
			onStartEdit,
			onStopEdit,
			editable = true,
			autoLink = true
		} = config;
		const store = createStore(config.initialState);

		let createdEntity;
		let backspaceAction;

		const modifiers = [
			(editorState) => {
				if (!editable) { return editorState; }

				const entityKey = getSelectedEntityKey(editorState);

				//Wait an event pump to give subsequent events a chance
				//to fire and set up the store appropriately
				wait()
					.then(() => {
						store.setItem(SelectedEntityKey, entityKey || createdEntity);
						createdEntity = null;
					});

				return editorState;
			},
			(editorState) => {
				return fixStateForAllowed(editorState, allowedInBlockTypes);
			}
		];

		return {
			stateStore: store,

			onChange (editorState, ...args) {
				return modifiers.reduce((editorStateAcc, modifier) => {
					return modifier(editorStateAcc, ...args);
				}, editorState);
			},


			handleKeyCommand (command, editorState, {setEditorState}) {
				if (command !== 'backspace' || !backspaceAction) { return NOT_HANDLED; }

				const newEditorState = backspaceAction(editorState);

				backspaceAction = null;

				if (newEditorState) {
					setEditorState(newEditorState);
					return HANDLED;
				}

				return NOT_HANDLED;
			},


			handleBeforeInput (chars, editorState, {setEditorState}) {
				if (!autoLink) {
					backspaceAction = null;
					return NOT_HANDLED;
				}

				const {editorState: newEditorState, undo} = linkifyContent(chars, editorState) || {};

				backspaceAction = undo;

				if (newEditorState) {
					setEditorState(newEditorState);
					return HANDLED;
				}

				return NOT_HANDLED;
			},


			decorators: [
				{
					strategy,
					component: function LinkWrapper (props) {
						return (
							<Link store={store} {...props} />
						);
					}
				}
			],

			overlayComponent: function OverlayWrapper (props) {
				return (
					<Overlay {...props} store={store} onStartEdit={onStartEdit} onStopEdit={onStopEdit} />
				);
			},


			getContext (getEditorState, setEditorState) {
				return {
					get allowLinks () {
						const editorState = getEditorState();

						return editable && isValidSelectionForLink(editorState, allowedInBlockTypes);
					},
					get currentLink () {
						return getSelectedEntityKey(getEditorState());
					},
					get isEditingLink () {
						return Boolean(store.getItem(EditingEntityKey));
					},
					toggleLink: (link) => {
						if (!editable) { return; }

						const editorState = getEditorState();
						const selectedEntity = getSelectedEntityKey(editorState);

						if (selectedEntity) {
							store.setItem(EditingEntityKey, selectedEntity);
						} else {
							const entity = createEntity(link || getFirstSelectedEntityHref(editorState));

							createdEntity = entity;

							setEditorState(RichUtils.toggleLink(editorState, editorState.getSelection(), entity));
						}
					}
				};
			}
		};
	}
};
