import React from 'react';

import {ENTITIES} from '../../../Constants';

import Link from './components/Link';

const Name = Symbol('Link Decorate');

function strategy (contentBlock, callback, contentState) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();

			return entityKey !== null && contentState.getEntity(entityKey).getType() === ENTITIES.LINK;
		},
		callback
	);
}

export const create = (config) => {
	return {
		name: Name,

		combine (otherPlugin) {
			debugger;
		},

		decorators: [
			{
				strategy,
				component: function LinkWrapper (props) {
					return (
						<Link {...props} />
					);
				}
			}
		]
	};
};