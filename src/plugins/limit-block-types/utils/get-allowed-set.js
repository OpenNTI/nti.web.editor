import {BLOCK_SET} from '../../../Constants';

export default function getAllowedSet (allow, disallow) {
	if (!allow && !disallow) { return BLOCK_SET; }

	//TODO: union the allow and disallow and set

	return allow;
}
