import {ENTITIES} from '../../../Constants';

isLinkEntity.isAutoLink = (entity) => isLinkEntity(entity) && entity.getData?.()?.autoLink;
isLinkEntity.isCustomLink = (entity) => isLinkEntity(entity) && entity.getData?.()?.isCustom;
export default function isLinkEntity (entity) {
	return entity.getType() === ENTITIES.LINK;
}