import { SelectionState } from 'draft-js';

function getCharInfoAt(content, blockKey, index) {
	if (index < 0) {
		return null;
	}

	const block = content.getBlockForKey(blockKey);

	const meta = block?.getCharacterList()?.get(index)?.toJS();

	if (!meta) {
		return null;
	}

	return {
		...meta,
		char: block?.getText()?.charAt(index),
	};
}

function isValidNewTagMember(charInfo, strat) {
	return strat.isValidMember(charInfo.char);
}

function isValidNewTagStart(charInfo, strat) {
	return !charInfo.entity && strat.isValidStart(charInfo.char);
}

export function findNewTagBeforeSelection(strategies, editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	if (selection.getFocusKey() !== selection.getAnchorKey()) {
		return null;
	}

	const blockKey = selection.getEndKey();
	const blockType = content.getBlockForKey(blockKey).getType();
	const start = selection.getEndOffset();

	let validStrategies = new Set(
		strategies.filter(strat => strat.allowedInBlockTypes.has(blockType))
	);
	let pointer = start - 1;
	let charInfo = getCharInfoAt(content, blockKey, pointer);

	//While we have strategies still possible and characters to look at
	while (validStrategies.size > 0 && charInfo) {
		for (let strat of validStrategies) {
			//If its the valid start of a strategy and there was more text than
			//just the trigger we found a valid tag!
			if (isValidNewTagStart(charInfo, strat)) {
				return {
					selection: new SelectionState({
						anchorKey: blockKey,
						anchorOffset: pointer,
						focusKey: blockKey,
						focusOffset: start,
					}),
					strategy: strat,
				};
			}

			//if the character would not be a valid member of the
			//strategy remove the strategy from the possible
			if (!isValidNewTagMember(charInfo, strat)) {
				validStrategies.delete(strat);
			}
		}

		pointer -= 1;
		charInfo = getCharInfoAt(content, blockKey, pointer);
	}

	return null;
}

export function findAllNewTags(strategies, editorState) {}

export function findExistingTagBeforeSelection(strategies, editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const blockKey = selection.getStartKey();
	const offset = selection.getStartOffset();

	const charInfo = getCharInfoAt(content, blockKey, offset - 1);

	const entity = charInfo?.entity ? content.getEntity(charInfo.entity) : null;

	for (let strat of strategies) {
		if (strat.coversEntity(entity)) {
			return {
				entity: charInfo.entity,
				selection,
				strategy: strat,
			};
		}
	}

	return null;
}

export function getSelectionForTag(entityKey, editorState, blockKey) {
	const content = editorState.getCurrentContent();

	const block = content.getBlockForKey(blockKey); //if not given a block key find the block that has the entity

	let start = null;
	let end = null;

	block.findEntityRanges(
		char => char.getEntity() === entityKey,
		(s, e) => ((start = s), (end = e))
	);

	return new SelectionState({
		anchorKey: block.getKey(),
		focusKey: block.getKey(),
		anchorOffset: start,
		focusOffset: end,
	});
}
