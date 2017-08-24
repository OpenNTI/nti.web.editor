import strategy from '../external-links/strategy';

import Anchor from './components/Anchor';
import {addEntitiesForLinks} from './utils';

export const create = (config = {}) => {
	const {hideDecorator} = config;

	return {
		decorators: hideDecorator ? [] : [{
			strategy,
			component: Anchor
		}],

		onChange (editorState) {
			const newState = addEntitiesForLinks(editorState);

			return newState;
		}
	};
};
