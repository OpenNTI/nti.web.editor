import {isLinkEntity} from '../../link-utils';

const appendToSet = (acc, char) => {
	if (char.entity) {
		acc.add(char.entity);
	}

	return acc;
};

export default function findLinks (content) {
	const entitiesByBlock = content
		.getBlocksAsArray()
		.reduce((acc, block) => {
			const key = block.getKey();
			const entities = block.getCharacterList().toJS().reduce(appendToSet, new Set());


			return {
				...acc,
				[key]: Array.from(entities)
			};
		}, {});

	return Object.entries(entitiesByBlock)
		.reduce((acc, [blockKey, entities]) => {
			for (let entityKey of entities) {
				const entity = content.getEntity(entityKey);

				if (isLinkEntity(entity)) {
					acc.push({
						blockKey,
						entityKey,
						entity
					});
				}
			}

			return acc;
		}, []);
}
