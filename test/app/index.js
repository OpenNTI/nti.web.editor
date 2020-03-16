/*eslint no-console: 0*/
// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Events} from '@nti/lib-commons';
import {Errors} from '@nti/web-commons';

import {
	Editor,
	ContextProvider,
	generateID,
	BoldButton,
	ItalicButton,
	UnderlineButton,
	ActiveType,
	TypeButton,
	LinkButton,
	Plugins,
	Parsers,
	BLOCKS,
	BLOCK_SET,
	STYLE_SET,
	ENTITIES
} from '../../src';
// import RSTTest from '../../src/RST/test';

const {getKeyCode} = Events;

const {Field:{Factory:ErrorFactory}} = Errors;
const errorFactory = new ErrorFactory();
const error = errorFactory.make({NTIID: 'Fake ID', label: 'Fake Field'}, {Code: 'TooShort', message: 'Too Short'});


const {ErrorMessage, WarningMessage} = Plugins.Messages.components;
const {CharacterCounter} = Plugins.Counter.components;

const plugins = [
	// Plugins.EnsureFocusableBlock.create(),
	Plugins.LimitStyles.create({allow: STYLE_SET}),
	Plugins.LimitBlockTypes.create({allow: BLOCK_SET}),
	Plugins.ExternalLinks.create({allowedInBlockTypes: new Set([BLOCKS.UNSTYLED, BLOCKS.BLOCKQUOTE])}),
	Plugins.ContiguousEntities.create(),
	Plugins.Tagging.create({trigger: '@', type: Plugins.Tagging.Mention})
	// Plugins.Plaintext.create(),
	// Plugins.Messages.create(),
	// Plugins.Counter.create({character: {limit: 10}}),
	// Plugins.InlineLinks.create()
];

const editorID = generateID();

const initialState = Parsers.HTML.toDraftState('');

class Test extends React.Component {
	state = {editor: null, editorState: initialState}

	attachEditorRef = x => {
		global.EditorRef = x;
		this.setState({editor: x});
	}



	onFocusToEnd = () => {
		const {editor} = this.state;

		if (editor) {
			editor.focusToEnd();
		}
	}


	logHTMLValue = () => {
		const {editorState, modifiedEditorState} = this.state;

		this.setState({
			html: Parsers.HTML.fromDraftState(modifiedEditorState || editorState)
		});
	}


	onContentChange = (editorState) => {
		this.setState({
			modifiedEditorState: Parsers.HTML.toDraftState(Parsers.HTML.fromDraftState(editorState))
		});
	}


	render () {
		const {html, editorState} = this.state;
		const customKeyBindings = {
			[getKeyCode.TAB]: () => console.log('TAB PRESSED')
		};

		return (
			<div>
				<Editor
					ref={this.attachEditorRef}
					editorState={editorState}
					plugins={plugins}
					customKeyBindings={customKeyBindings}
					id={editorID}
					onContentChange={this.onContentChange}
				/>
				<ContextProvider editorID={editorID}>
					<div>
						<div>
							<button onClick={this.onFocusToEnd}>Focus to End</button>
						</div>
						<div>
							<CharacterCounter />
						</div>
						<div>
							<ErrorMessage error={error} />
							<WarningMessage />
						</div>
						<div>
							<BoldButton />
							<ItalicButton />
							<UnderlineButton />
							<LinkButton />
						</div>
						<div>
							<span>Active:</span>
							<ActiveType />
						</div>
						<div>
							<TypeButton type={BLOCKS.CODE} plain checkmark />
							<TypeButton type={BLOCKS.UNSTYLED} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_ONE} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_TWO} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_THREE} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_FOUR} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_FIVE} plain checkmark />
							<TypeButton type={BLOCKS.HEADER_SIX} plain checkmark />
							<TypeButton type={BLOCKS.ORDERED_LIST_ITEM} plain checkmark />
							<TypeButton type={BLOCKS.UNORDERED_LIST_ITEM} plain checkmark />
							<TypeButton type={BLOCKS.BLOCKQUOTE} plain checkmark />
						</div>
						<div>
							<button onClick={this.logHTMLValue}>Log HTML Value</button>
							<pre>
								{html}
							</pre>
						</div>
					</div>
				</ContextProvider>
			</div>
		);
	}
}


ReactDOM.render(
	<Test />,
	document.getElementById('content')
);
