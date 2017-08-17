import {Modifier, BlockMapBuilder, SelectionState, ContentBlock, genKey, EditorState} from 'draft-js';
//We don't really need immutable its just something draft needs so let draft depend on it
import {List} from 'immutable';//eslint-disable-line import/no-extraneous-dependencies

import {BLOCKS, CHANGE_TYPES} from '../../../Constants';

import fixSelection from './fix-selection';
import removeContent from './remove-content';

//Modified from the atomic block utils: https://github.com/facebook/draft-js/blob/213cd764f61cc64552bddd672ae1748529d55333/src/model/modifier/AtomicBlockUtils.js

function fixContentAndSelection (content, selection, replace) {
	const willRemove = replace && !selection.isCollapsed();
	const fixedContent = willRemove ? removeContent(content, selection) : content;
	const fixedSelection = willRemove ? fixedContent.getSelectionAfter() : fixSelection(content, selection, willRemove);

	return {fixedContent, fixedSelection};
}

function splitContentAndGetSelection (content, selection) {
	const splitContent = Modifier.splitBlock(content, selection);

	return {
		splitContent,
		insertionSelection: splitContent.getSelectionAfter()
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


function getPreviousSelection (editorState, selectionState, newBlock) {
	const focusKey = selectionState.getFocusKey();
	const currentContent = editorState.getCurrentContent();
	const block = currentContent && currentContent.getBlockForKey(focusKey);
	const type = block && block.getType();
	const nextBlockKey = currentContent.getKeyAfter(focusKey);

	if (type !== BLOCKS.ATOMIC) {
		return selectionState;
	}

	return new SelectionState(Object.assign({}, selectionState.toJS(), {
		anchorKey: nextBlockKey,
		focusKey: nextBlockKey,
	}));
}


export default function insertBlock (block, replace, selection, editorState) {
	const currentContent = editorState.getCurrentContent();
	const currentSelection = selection || editorState.getSelection();
	const previousSelection = getPreviousSelection(editorState, currentSelection, block);

	//TODO, when replacing look into pulling entity and style range info into the new blocks character data
	const {fixedContent, fixedSelection} = fixContentAndSelection(currentContent, previousSelection, replace);
	const {splitContent, insertionSelection} = splitContentAndGetSelection(fixedContent, fixedSelection);

	const asType = Modifier.setBlockType(splitContent, insertionSelection, block.type);

	const fragment = BlockMapBuilder.createFromArray([
		new ContentBlock({
			key: genKey(),
			type: block.type,
			text: block.text,
			data: block.data || {},
			characterList: List()
		}),
		new ContentBlock({
			key: genKey(),
			type: BLOCKS.UNSTYLED,
			text: '',
			characterList: List()
		})
	]);

	const withBlock = Modifier.replaceWithFragment(asType, insertionSelection, fragment);

	const newContent = withBlock.merge({
		selectionBefore: previousSelection,
		selectionAfter: getNewSelection(withBlock, block, insertionSelection.getStartKey())
	});

	return EditorState.push(editorState, newContent, CHANGE_TYPES.INSERT_FRAGMENT);
}
