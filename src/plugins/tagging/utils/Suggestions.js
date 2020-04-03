export function getSuggestion (strategy, entityKey, blockKey, offsetKey, editorState) {
	const content = editorState.getCurrentContent();

	const entity = content.getEntity(entityKey);

	return entity?.getData()?.suggestion;
}

export function getSuggestionSearch (strategy, entity, blockKey, offsetKey, editorState) {
	const content = editorState.getCurrentContent();
	const selection = editorState.getSelection();

	const block = content.getBlockForKey(blockKey);
	const text = block?.getText();
	const chars = block?.getCharacterList()?.toArray();

	const startOfEntity = chars?.findIndex((char) => char.entity === entity);
	const endOfSelection = selection.getEndOffset();
	
	if (startOfEntity == null || endOfSelection <= startOfEntity) { return null; }

	const searchTerm = text?.substring(startOfEntity, endOfSelection) ?? '';
	const searchChars = searchTerm.split('');

	let validSearch = '';

	for (let searchChar of searchChars) {
		if (strategy.isValidMember(searchChar)) {
			validSearch += searchChar;
		} else {
			return validSearch;
		}
	}

	return validSearch;
}