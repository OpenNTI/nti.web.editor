import React from 'react';
import {wait} from '@nti/lib-commons';

import {createStore} from '../../Store';
import {create as CreateDecorate} from '../decorate';

import LinkWrapper from './components/LinkWrapper';
import LinkOverlay from './components/LinkOverlay';
import {getSelectedEntityKey} from './utils';

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


		overlayComponent: LinkOverlayInstance
	};
};