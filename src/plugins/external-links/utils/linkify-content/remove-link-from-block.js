import {Modifier} from 'draft-js';

import getSelectionForLinkInBlock from './get-selection-for-link-in-block';

export default function removeLinkFromBlock (block, link, startOffset, content) {
	const selection = getSelectionForLinkInBlock(block, link, startOffset);

	return Modifier.applyEntity(content, selection, null);
}
