import {ENTITIES, MUTABILITY} from '../../../Constants';

createLinkEntity.createAutoLink = (content, href) => createLinkEntity(content, href, false, {autoLink: true});
createLinkEntity.createCustomLink = (content, href) => createLinkEntity(content, href, false, {customLink: true});
export default function createLinkEntity (content, href, contiguous, extraData) {
	//If the contiguous-entity plugin is included the contigous false flag will prevent
	//the entity from expanding if you type after it
	return content.createEntity(ENTITIES.LINK, MUTABILITY.MUTABLE, {href, contiguous, ...extraData});
}