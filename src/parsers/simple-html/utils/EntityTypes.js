import getTagName from './get-tag-name';

const EntityTag = 'a';

function attributesToEntityData (node) {

}

function entityDataToAttributes (entity) {

}

export function getEntityForNode (node) {
	const tagName = getTagName(node);

	if (tagName !== EntityTag) { return null; }


}

export function getNodeForEntity (node) {

}