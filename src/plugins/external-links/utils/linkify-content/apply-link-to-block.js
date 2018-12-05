import {Modifier, SelectionState} from 'draft-js';

import {createLinkEntity} from '../../../../utils';

import getSelectionForLinkInBlock from './get-selection-for-link-in-block';

export default function applyLinkToBlock (block, link, startOffset, content) {
	const entity = createLinkEntity(content, link.url).getLastCreatedEntityKey();

	const selection = getSelectionForLinkInBlock(block, link, startOffset);

	return Modifier.applyEntity(content, selection, entity);
}
