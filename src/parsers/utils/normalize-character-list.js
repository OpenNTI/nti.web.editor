function createTagList() {
	return {
		open: { entity: null, style: new Set() },
		close: { entity: null, style: new Set() },
	};
}

function openStyles(tagList, styles) {
	for (let style of styles) {
		tagList.open.style.add(style);
	}

	return tagList;
}

function closeStyles(tagList, styles) {
	for (let style of styles) {
		tagList.close.style.add(style);
	}

	return tagList;
}

function openEntity(tagList, entity) {
	tagList.open.entity = entity;

	return tagList;
}

function closeEntity(tagList, entity) {
	tagList.close.entity = entity;

	return tagList;
}

function getStylesToClose(open, styles) {
	const toClose = new Set(open.style);

	for (let style of styles) {
		toClose.delete(style);
	}

	return toClose;
}

function getStylesToOpen(open, styles) {
	const toOpen = new Set(styles);

	for (let style of open.style) {
		toOpen.delete(style);
	}

	return toOpen;
}

function syncOpenedTags(open, tagList) {
	open = { ...open };

	if (tagList.close.entity === open.entity) {
		open.entity = null;
	}

	if (tagList.open.entity) {
		open.entity = tagList.open.entity;
	}

	for (let style of tagList.close.style) {
		open.style.delete(style);
	}

	for (let style of tagList.open.style) {
		open.style.add(style);
	}

	return open;
}

function closeOpenTags(open) {
	let tagList = createTagList();

	if (open.entity) {
		tagList = closeEntity(tagList, open.entity);
	}

	tagList = closeStyles(tagList, open.style);

	return tagList;
}

export default function normalizeCharacterList(characterList) {
	characterList = characterList.toJS();

	let tags = {};

	let open = { entity: null, style: new Set() };

	for (let i = 0; i < characterList.length; i++) {
		let { entity, style } = characterList[i];
		let tagList = createTagList();

		if (entity != null && entity !== open.entity) {
			tagList = closeStyles(tagList, open.style);
			tagList = closeEntity(tagList, open.entity);

			tagList = openEntity(tagList, entity);
			tagList = openStyles(tagList, style);
		} else if (entity == null && open.entity !== null) {
			tagList = closeStyles(tagList, open.style);
			tagList = closeEntity(tagList, open.entity);

			tagList = openStyles(tagList, style);
		} else {
			tagList = closeStyles(tagList, getStylesToClose(open, style));
			tagList = openStyles(tagList, getStylesToOpen(open, style));
		}

		tags[i] = tagList;
		open = syncOpenedTags(open, tagList);
	}

	tags[characterList.length] = closeOpenTags(open);

	return tags;
}
