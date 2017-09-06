import {STYLES} from '../../../Constants';

import openTag from './open-tag';
import closeTag from './close-tag';

const TAGS = {
	[STYLES.BOLD]: 'b',
	[STYLES.CODE]: 'code',
	[STYLES.ITALIC]: 'i',
	[STYLES.UNDERLINE]: 'u'
};

function escapeHTML (t) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(t));
	return div.innerHTML;
}

export default function renderContentBlockContent (tree, block) {
	const openTags = tags => tags.map(openTag).join('');
	const closeTags = tags => tags.slice().reverse().map(closeTag).join('');

	const toTagNames = style => TAGS[style] || `undefined:${style}`;

	const getOffsetAndTags = (leaf) => [
		leaf.get('start'),
		leaf.get('end'),
		block.getInlineStyleAt(leaf.get('start')).toJS().map(toTagNames)
	];

	const text = block.getText();

	return tree.map((leafSet) => {
		return leafSet.get('leaves').map((leaf) => {
			const [start, end, tags] = getOffsetAndTags(leaf);

			return `${openTags(tags)}${escapeHTML(text.slice(start, end))}${closeTags(tags)}`;
		}).join('');
	}).join('');
}
