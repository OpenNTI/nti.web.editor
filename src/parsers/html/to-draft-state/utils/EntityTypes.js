import { ENTITIES, MUTABILITY } from '../../../../Constants';

import getTagName from './get-tag-name';

const EntityTag = 'a';

function attributesToEntityData(node) {
	const entity = {
		type: ENTITIES.LINK,
		mutability: MUTABILITY.MUTABLE,
		data: {},
	};

	const attributes = Array.from(node.attributes);

	for (let attribute of attributes) {
		const name = attribute.name;
		let value = attribute.value;

		if (value === 'false') {
			value = false;
		}
		if (value === 'true') {
			value = true;
		}

		if (name === 'href') {
			entity.data.href = value;
		} else if (name.startsWith('data-nti-entity-')) {
			const key = name.replace(/^data-nti-entity-/, '');

			if (key === 'type') {
				entity.type = value;
			} else if (key === 'mutability') {
				entity.mutability = value;
			} else {
				entity.data[key] = value;
			}
		}
	}

	return entity;
}

export function getEntityForNode(node) {
	const tagName = getTagName(node);

	if (tagName !== EntityTag) {
		return null;
	}

	return attributesToEntityData(node);
}

export function getNodeForEntity(node) {}
