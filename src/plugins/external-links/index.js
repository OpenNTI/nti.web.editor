import { EditorState, Modifier } from 'draft-js';

import { wait } from '@nti/lib-commons';

import { CHANGE_TYPES } from '../../Constants';
import { createLinkEntity } from '../../utils';
import { HANDLED, NOT_HANDLED } from '../Constants';
import { createStore } from '../Store';

import Link from './components/Link';
import Overlay from './components/Overlay';
import { SelectedEntityKey, EditingEntityKey } from './Constants';
import strategy from './strategy';
import {
	getSelectedEntityKey,
	getFirstSelectedEntityHref,
	isValidSelectionForLink,
	fixStateForAllowed,
	linkifyContent,
} from './utils';

export default {
	create: (config = {}) => {
		const {
			allowedInBlockTypes,
			onStartEdit,
			onStopEdit,
			editable = true,
			autoLink = true,
		} = config;
		const store = createStore(config.initialState);

		let createdEntity;
		let backspaceAction;

		const modifiers = [
			editorState => {
				if (!editable) {
					return editorState;
				}

				const entityKey = getSelectedEntityKey(editorState);

				//Wait an event pump to give subsequent events a chance
				//to fire and set up the store appropriately
				wait().then(() => {
					store.setItem(
						SelectedEntityKey,
						entityKey || createdEntity
					);
					createdEntity = null;
				});

				return editorState;
			},
			editorState => {
				return fixStateForAllowed(editorState, allowedInBlockTypes);
			},
		];

		return {
			stateStore: store,

			onChange(editorState, ...args) {
				return modifiers.reduce((editorStateAcc, modifier) => {
					return modifier(editorStateAcc, ...args);
				}, editorState);
			},

			handleKeyCommand(
				command,
				editorState,
				eventTime,
				{ setEditorState }
			) {
				if (command !== 'backspace' || !backspaceAction) {
					return NOT_HANDLED;
				}

				const newEditorState = backspaceAction(editorState);

				backspaceAction = null;

				if (newEditorState) {
					setEditorState(newEditorState);
					return HANDLED;
				}

				return NOT_HANDLED;
			},

			handleBeforeInput(
				chars,
				editorState,
				eventTime,
				{ setEditorState }
			) {
				if (!autoLink) {
					backspaceAction = null;
					return NOT_HANDLED;
				}

				const { editorState: newEditorState, undo } =
					linkifyContent.beforeInput(
						chars,
						editorState,
						allowedInBlockTypes
					) || {};

				backspaceAction = undo;

				if (newEditorState) {
					setEditorState(newEditorState);
					return HANDLED;
				}

				return NOT_HANDLED;
			},

			handleReturn(chars, editorState, { setEditorState }) {
				if (!autoLink) {
					backspaceAction = null;
					return NOT_HANDLED;
				}

				const { editorState: newEditorState, undo } =
					linkifyContent.handleReturn(
						editorState,
						allowedInBlockTypes
					) || {};

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
					component: function LinkWrapper(props) {
						return <Link store={store} {...props} />;
					},
				},
			],

			overlayComponent: function OverlayWrapper(props) {
				return (
					<Overlay
						{...props}
						store={store}
						onStartEdit={onStartEdit}
						onStopEdit={onStopEdit}
					/>
				);
			},

			getContext(getEditorState, setEditorState) {
				return {
					get allowLinks() {
						const editorState = getEditorState();

						return (
							editable &&
							isValidSelectionForLink(
								editorState,
								allowedInBlockTypes
							)
						);
					},
					get currentLink() {
						return getSelectedEntityKey(getEditorState());
					},
					get isEditingLink() {
						return Boolean(store.getItem(EditingEntityKey));
					},
					toggleLink: link => {
						if (!editable) {
							return;
						}

						const editorState = getEditorState();
						const selectedEntity = getSelectedEntityKey(
							editorState
						);

						if (selectedEntity) {
							store.setItem(EditingEntityKey, selectedEntity);
						} else {
							const href =
								link || getFirstSelectedEntityHref(editorState);

							const content = editorState.getCurrentContent();
							const entity = createLinkEntity(
								content,
								href,
								true,
								{}
							).getLastCreatedEntityKey();

							createdEntity = entity;

							const newContent = Modifier.applyEntity(
								content,
								editorState.getSelection(),
								entity
							);
							const newEditorState = EditorState.push(
								editorState,
								newContent,
								CHANGE_TYPES.APPLY_ENTITY
							);

							setEditorState(newEditorState);
						}
					},
				};
			},
		};
	},
};
