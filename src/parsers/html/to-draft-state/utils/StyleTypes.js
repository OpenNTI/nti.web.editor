import {STYLES} from '../../../../Constants';

import getTagName from './get-tag-name';

const StylesToTag = {
	[STYLES.BOLD]: ['b'],
	[STYLES.CODE]: ['code'],
	[STYLES.ITALIC]: ['em', 'i'],
	[STYLES.UNDERLINE]: ['u']
};

const TagToStyles = {};

for (let [key, value] of Object.entries(StylesToTag)) {
	for (let tag of value) {
		TagToStyles[tag] = key;
	}
}

export function getStyleForNode (node) {
	const tagName = getTagName(node);

	return TagToStyles[tagName];
}

export function getTagnameForStyle (style) {

}