import {ENTITIES, MUTABILITY} from '../Constants';

export default function createEntity (contentState, href, contiguous) {
	//If the contiguous-entity plugin is included the contigous false flag will prevent
	//the entity from expanding if you type after it
	return contentState.createEntity(ENTITIES.LINK, MUTABILITY.MUTABLE, {href, contiguous});
}
