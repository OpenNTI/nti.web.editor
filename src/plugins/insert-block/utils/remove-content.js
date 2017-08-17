import {Modifier} from 'draft-js';

export default function removeRangeAndFixSelection (content, selection) {
	return Modifier.removeRange(content, selection, 'backward');
}
