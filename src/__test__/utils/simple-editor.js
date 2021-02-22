import React from 'react';
import PropTypes from 'prop-types';
import { convertFromRaw, EditorState } from 'draft-js';

import { Editor, Parsers, generateID } from '../../index';

const defaultRawContent = {
	blocks: [
		{
			text: 'paragraph',
			type: 'unstyled',
			depth: 0,
			inlineStyleRanges: [],
			entityRanges: [],
		},
	],
	entityMap: {},
};
const editorID = generateID();

class SimpleEditor extends React.Component {
	static propTypes = {
		rawContent: PropTypes.object,
		editorState: PropTypes.object,
		plugins: PropTypes.array,
	};

	constructor(props) {
		super(props);

		const content = props.rawContent
			? convertFromRaw(props.rawContent)
			: convertFromRaw(defaultRawContent);
		const editorState = EditorState.createWithContent(content);
		this.state = {
			editorState: props.editorState || editorState,
			editor: null,
		};
	}

	attachEditorRef = x => {
		this.setState({ editor: x });
	};

	onContentChange = editorState => {
		this.setState({
			editorState: Parsers.HTML.toDraftState(
				Parsers.HTML.fromDraftState(editorState)
			),
		});
	};

	render() {
		const { editorState } = this.state;
		const { plugins } = this.props;

		return (
			<Editor
				ref={this.attachEditorRef}
				editorState={editorState}
				plugins={plugins}
				id={editorID}
				onContentChange={this.onContentChange}
			/>
		);
	}
}

export default SimpleEditor;
