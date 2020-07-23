import {ENTITIES} from '../../../Constants';

const getEntityData = e => e.getData?.() ?? {};

isLinkEntity.isAutoLink = (entity) => isLinkEntity(entity) && (getEntityData(entity)['link-type'] === 'auto');
isLinkEntity.isCustomLink = (entity) => isLinkEntity(entity) && (getEntityData(entity)['link-type'] === 'custom');
export default function isLinkEntity (entity) {
	return entity.getType() === ENTITIES.LINK;
}