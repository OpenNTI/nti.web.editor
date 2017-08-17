import PropTypes from 'prop-types';
import React from 'react';
import {EditorState, ContentState} from 'draft-js';

import Editor from './Editor';

function getEditorStateForValue (value) {
	return value ? EditorState.createWithContent(ContentState.createFromText(value)) : EditorState.createEmpty();
}


function getValueForEditorState (editorState) {
	const content = editorState.getCurrentContent();
	const blocks = content.getBlocksAsArray();

	return blocks.map(x => x.text).join('\n');
}

export default class PlaintextEditor extends React.Component {
	static propTypes = {
		value: PropTypes.string,
		onContentChange: PropTypes.func
	}


	constructor (props) {
		super(props);

		const {value} = props;

		this.state = {
			editorState: getEditorStateForValue(value)
		};
	}


	componentWillReceiveProps (nextProps) {
		const {value:nextValue} = nextProps;
		const {value:prevValue} = this.props;

		if (prevValue !== nextValue) {
			this.setState({
				editorState: getEditorStateForValue(nextValue)
			});
		}
	}


	onContentChange = (editorState) => {
		const {onContentChange} = this.props;
		const newValue = getValueForEditorState(editorState);

		if (onContentChange) {
			onContentChange(newValue);
		}
	}


	render () {
		const {editorState} = this.state;
		const {...otherProps} = this.props;

		delete otherProps.value;
		delete otherProps.editorState;
		delete otherProps.onContentChange;
		delete otherProps.allowedInlineStyles;
		delete otherProps.allowedBlockTypes;
		delete otherProps.allowLinks;

		return (
			<Editor
				editorState={editorState}
				onContentChange={this.onContentChange}
				allowedInlineStyles={[]}
				allowedBlockTypes={[]}
				allowLinks={false}
				{...otherProps}
			/>
		);
	}
}
