import {STYLES, ENTITIES} from '../../../Constants';
import {normalizeCharacterList} from '../../utils';

import openTag from './open-tag';
import closeTag from './close-tag';
import escapeHTML from './escape-html';

const TAGS = {
	[STYLES.BOLD]: 'b',
	[STYLES.CODE]: 'code',
	[STYLES.ITALIC]: 'i',
	[STYLES.UNDERLINE]: 'u'
};

const TAG_ORDER = [STYLES.BOLD, STYLES.ITALIC, STYLES.CODE, STYLES.UNDERLINE];

function generateOpenTags (tagList, content) {
	const {open} = tagList;

	const styleTags = TAG_ORDER.reverse().map(x => open.style.has(x) ? openTag(TAGS[x]) : '');

	const entity = open.entity != null ? content.getEntity(open.entity) : null;
	const entityTags = entity && entity.type === ENTITIES.LINK ? [openTag('a', {href: entity.data.href})] : [];

	const tags = [...entityTags, ...styleTags];

	return tags.join('');

	// const styleTags = TAG_ORDER.map((x => range.style.has(x) ? openTag(TAGS[x]) : ''));

	// const entity = range.entity != null ? content.getEntity(range.entity) : null;
	// const entityTags = entity && entity.type === ENTITIES.LINK ? [openTag('a', {href: entity.data.href})] : [];

	// const tags = [...entityTags, ...styleTags];

	// return tags.join('');
}

function generateCloseTags (tagList, content) {
	const {close} = tagList;

	const styleTags = TAG_ORDER.reverse().map(x => close.style.has(x) ? closeTag(TAGS[x]) : '');

	const entity = close.entity != null ? content.getEntity(close.entity) : null;
	const entityTags = entity && entity.type === ENTITIES.LINK ? [closeTag('a')] : [];

	const tags = [...styleTags, ...entityTags];

	return tags.join('');

	// const styleTags = TAG_ORDER.reverse().map((x => range.style.has(x) ? closeTag(TAGS[x]) : ''));

	// const entity = range.entity != null ? content.getEntity(range.entity) : null;
	// const entityTags = entity && entity.type === ENTITIES.LINK ? [closeTag('a')] : [];

	// const tags = [...styleTags, ...entityTags];

	// return tags.join('');
}

export default function renderContentBlockContent (tree, block, content) {
	const tags = normalizeCharacterList(block.getCharacterList());

	let text = block.getText();
	let parsedText = '';

	for (let i = 0; i < text.length; i++) {
		let tagList = tags[i];
		let char = text.charAt(i);

		parsedText += `${generateCloseTags(tagList, content)}${generateOpenTags(tagList, content)}${escapeHTML(char)}`;
	}


	parsedText += `${generateCloseTags(tags[text.length], content)}`;

	return parsedText;
}


function xrenderContentBlockContent (tree, block, content) {
	const ranges = normalizeCharacterList(block.getCharacterList());
	const text = block.getText();

	let index = 0;
	let parsedText = '';

	for (let range of ranges) {
		let {offset, length} = range;

		if (offset !== index) {
			parsedText += escapeHTML(text.substr(index, offset - index));
		}

		parsedText += `${generateOpenTags(range, content)}${escapeHTML(text.substr(offset, length))}${generateCloseTags(range, content)}`;
		index = offset + length;
	}

	parsedText += escapeHTML(text.substr(index, text.length - index));

	return parsedText;
	// const openTags = tags => tags.map(openTag).join('');
	// const closeTags = tags => tags.slice().reverse().map(closeTag).join('');

	// const toTagNames = style => TAGS[style] || `undefined:${style}`;

	// const getOffset = (leaf) => [leaf.get('start'), leaf.get('end')];
	// const getStyleTags = ([start]) => block.getInlineStyleAt(start).toJS().map(toTagNames);
	// const anchorTags = ([start])


	// const getOffsetAndTags = (leaf) => [
	// 	leaf.get('start'),
	// 	leaf.get('end'),
	// 	block.getInlineStyleAt(leaf.get('start')).toJS().map(toTagNames)
	// ];

	// const text = block.getText();

	// return tree.map((leafSet) => {
	// 	return leafSet.get('leaves').map((leaf) => {
	// 		const [start, end, tags] = getOffsetAndTags(leaf);

	// 		return `${openTags(tags)}${escapeHTML(text.slice(start, end))}${closeTags(tags)}`;
	// 	}).join('');
	// }).join('');
}
