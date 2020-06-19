import {STYLES} from '../../../../Constants';
import {normalizeCharacterList} from '../../../utils';

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

function getEntityAttributes (entity) {
	const attributes = {
		'data-nti-entity-type': entity.type,
		'data-nti-entity-mutability': entity.mutability
	};

	if (entity.data.href) {
		attributes['href'] = entity.data.href;
	}

	for (let [key, value] of Object.entries(entity?.data ?? {})) {
		attributes[`data-nti-entity-${key}`] = value;
	}

	return attributes;
}

function generateOpenTags (tagList, content) {
	const {open} = tagList;

	const styleTags = TAG_ORDER.reverse().map(x => open.style.has(x) ? openTag(TAGS[x]) : '');

	const entity = open.entity != null ? content.getEntity(open.entity) : null;
	const entityTags = entity ? [openTag('a', getEntityAttributes(entity))] : [];

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
	const entityTags = entity ? [closeTag('a')] : [];

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
