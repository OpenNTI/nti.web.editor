import React from 'react';
import {Modifier, EditorState} from 'draft-js';
import {wait} from '@nti/lib-commons';

import {CHANGE_TYPES} from '../../../Constants';
import {createStore} from '../../Store';
import {createLinkEntity} from '../link-utils';
import {create as CreateDecorate} from '../decorate';

import LinkWrapper from './components/LinkWrapper';
import LinkOverlay from './components/LinkOverlay';
import {getSelectedEntityKey, getHrefForSelection} from './utils';

const SelectedEntity = 'selection';
const FocusedKey = 'has-focus';
const EditingKey = 'editing';

export const create = () => {
	const store = createStore({});

	store.SelectedEntityKey = SelectedEntity;
	store.EditingKey = EditingKey;

	const LinkWrapperInstance = (props) => (<LinkWrapper {...props} store={store} />);
	const LinkOverlayInstance = (props) => (<LinkOverlay {...props} store={store} />);

	let blurTimeout = null;

	return {
		plugins: [
			CreateDecorate({
				LinkWrapper: LinkWrapperInstance
			})
		],

		onChange (editorState) {
			const entityKey = getSelectedEntityKey(editorState);

			//Wait an event pump to give the subsequent events a chance
			//to fire and set up the store appropriately
			wait()
				.then(() => store.setItem(SelectedEntity, entityKey));

			return editorState;
		},

		overlayComponent: LinkOverlayInstance,

		getContext (getEditorState, setEditorState) {
			return {
				get allowLinks () {
					const editorState = getEditorState();
					const selection = editorState.getSelection();

					return selection && !selection.isCollapsed();
				},
				get currentLink () {
					return getSelectedEntityKey(getEditorState());
				},
				get isEditingLink () {
					return Boolean(store.getItem(EditingKey));
				},
				toggleLink (link) {
					const editorState = getEditorState();
					const selectedEntity = getSelectedEntityKey(editorState);

					if (selectedEntity) {
						store.setItem(EditingKey, selectedEntity);
					} else {
						const href = link || getHrefForSelection(editorState);

						const content = editorState.getCurrentContent();
						
						let newContent = createLinkEntity.createCustomLink(content, href || '');
						const entityKey = newContent.getLastCreatedEntityKey();

						store.setItem(EditingKey, entityKey);
						newContent = Modifier.applyEntity(newContent, editorState.getSelection(), entityKey);

						setEditorState(
							EditorState.push(editorState, newContent, CHANGE_TYPES.APPLY_ENTITY)
						);
					}
				}
			};
		}
	};
};