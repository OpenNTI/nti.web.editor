import {ENTITIES} from '../../Constants';

export default function (contentBlock, callback, contentState) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();

			return entityKey !== null && contentState.getEntity(entityKey).getType() === ENTITIES.LINK;
		},
		callback
	);
}
