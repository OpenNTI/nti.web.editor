import {STYLE_SET} from '../../../Constants';

export default function getAllowedSet (allow, disallow) {
	if (!allow && !disallow) { return STYLE_SET; }

	//TODO: union the allow and disallow and set

	return allow;
}
