function getContent (editorStateOrBlock) {
	return editorStateOrBlock.getCurrentContent ? editorStateOrBlock.getCurrentContent() : editorStateOrBlock;
}

function getText (content, delimiter) {
	return content.getPlainText ?
		content.getPlainText(delimiter) :
		content.getText ?
			content.getText() :
			'';
}

export default function getPlainText (editorStateOrBlock, delimiter) {
	const content = getContent(editorStateOrBlock);

	return content ? getText(content, delimiter) : '';
}
