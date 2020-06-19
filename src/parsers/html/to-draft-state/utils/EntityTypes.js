import {ENTITIES, MUTABILITY} from '../../../../Constants';

import getTagName from './get-tag-name';

const EntityTag = 'a';

function attributesToEntityData (node) {
	const keys = Object.keys(node.dataset);
	const entity = {
		type: ENTITIES.LINK,
		mutability: MUTABILITY.MUTABLE,
		data: {}
	};

	if (node.hasAttribute('href')) {
		entity.data.href = node.getAttribute('href');
	}

	for (let key of keys) {
		if (key.startsWith('ntiEntity')) {
			const entityKey = key.replace(/^ntiEntity/, '').toLowerCase();
			const value = node.dataset[key];

			if (entityKey === 'type') {
				entity.type = value;
			} else if (entityKey === 'mutability') {
				entity.mutability = value;
			} else {
				entity.data[entityKey] = value;
			}

		}
	}

	return entity;
}


export function getEntityForNode (node) {
	const tagName = getTagName(node);

	if (tagName !== EntityTag) { return null; }

	return attributesToEntityData(node);
}

export function getNodeForEntity (node) {

}