import {Modifier, SelectionState, EditorState} from 'draft-js';

import {BLOCKS, CHANGE_TYPES} from '../Constants';

function fixContentAndSelection (content, selection) {
	const willRemove = !selection.isCollapsed();
	const fixedContent = willRemove ? Modifier.removeRange(content, selection, 'backward') : content;
	const fixedSelection = willRemove ? fixedContent.getSelectionAfter() : selection;

	return {
		content: fixedContent,
		selection: fixedSelection
	};
}

function splitContentAndGetSelection (content, selection) {
	const splitContent = Modifier.splitBlock(content, selection);

	return {
		content: splitContent,
		selection: splitContent.getSelectionAfter()
	};
}

function getNewSelection (content, block, key) {
	if (block.type === BLOCKS.ATOMIC) { return content.getSelectionAfter().set('hasFocus', true); }

	const offset = block.text.length;

	return new SelectionState({
		anchorKey: key,
		anchorOffset: offset,
		focusKey: key,
		focusOffset: offset,
		hasFocus: true
	});
}

function getPreviousSelection (editorState, selection) {
	const focusKey = selection.getFocusKey();
	const currentContent = editorState.getCurrentContent();

	const selectedBlock = currentContent?.getBlockForKey(focusKey);
	const selectedType = selectedBlock?.getType();
	const nextBlockKey = currentContent?.getKeyAfter(focusKey);

	if (selectedType !== BLOCKS.ATOMIC) {
		return selection;
	}

	return new SelectionState({
		...selection.toJS(),
		anchorKey: nextBlockKey,
		focusKey: nextBlockKey
	});
}

export default function insertFragment (fragment, selection, editorState) {
	const block = fragment.first();

	const currentContent = editorState.getCurrentContent();
	const previousSelection = getPreviousSelection(editorState, selection);

	const {content:fixedContent, selection:fixedSelection} = fixContentAndSelection(currentContent, previousSelection);
	const {content:splitContent, selection: splitSelection} = splitContentAndGetSelection(fixedContent, fixedSelection);

	const asType = Modifier.setBlockType(splitContent, splitSelection, block.type);

	const withBlock = Modifier.replaceWithFragment(asType, splitSelection, fragment);
	const newContent = withBlock.merge({
		selectionBefore: previousSelection,
		selectionAfter: getNewSelection(withBlock, block, splitSelection.getStartKey())
	});

	return EditorState.push(editorState, newContent, CHANGE_TYPES.INSERT_FRAGMENT);
}
