export default function updateLinkEntity(content, entityKey, href) {
	return content.mergeEntityData(entityKey, { href });
}
