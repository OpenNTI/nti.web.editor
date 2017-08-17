import {Entity} from 'draft-js';

import {ENTITIES} from '../../Constants';

export default function (contentBlock, callback) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();

			return entityKey !== null && Entity.get(entityKey).getType() === ENTITIES.LINK;
		},
		callback
	);
}
