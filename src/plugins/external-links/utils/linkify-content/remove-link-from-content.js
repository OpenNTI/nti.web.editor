import {Modifier} from 'draft-js';

export default function removeLinkFromContent (link, content) {
	return Modifier.applyEntity(content, link.selection, null);
}
