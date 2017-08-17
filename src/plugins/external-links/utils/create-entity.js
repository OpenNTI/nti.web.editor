import {Entity} from 'draft-js';

import {ENTITIES, MUTABILITY} from '../../../Constants';

export default function createLink (href) {
	//If the contiguous-entity plugin is included the contigous false flag will prevent
	//the entity from expanding if you type after it
	return Entity.create(ENTITIES.LINK, MUTABILITY.MUTABLE, {href, contiguous: false});
}
