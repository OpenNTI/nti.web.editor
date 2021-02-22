import { BLOCK_SET } from '../../../Constants';

export default function getAllowedSet(allow, disallow) {
	if (!allow && !disallow) {
		return BLOCK_SET;
	}

	//TODO: union the allow and disallow and set
	//TODO: write unit test for this once completed
	return allow;
}
