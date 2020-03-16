function getCharInfoAt (content, blockKey, index) {
	if (index < 0) { return null; }

	const block = content.getBlockForKey(blockKey);

	const meta = block?.getCharacterList()?.get(index)?.toJS();

	if (!meta) { return null; }

	return {
		...meta,
		char: block?.getText()?.charAt(index)
	};
}

function getCharInfoBefore (content, selection) {
	const blockKey = selection.getStartKey();
	const offset = selection.getStartOffset();


	return getCharInfoAt(content, blockKey, offset - 1);
}

export function beforeInput (strat, chars, editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const prevChar = getCharInfoBefore(content, selection);

	//check if we are in a tag, or if a new tag can be started
}

export function afterInput () {
	debugger;
}