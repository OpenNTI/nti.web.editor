/*eslint no-console: 0*/
// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Events} from '@nti/lib-commons';
import {Errors, List} from '@nti/web-commons';
import '@nti/style-common/variables.css';

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

console.log('Two React Versions: ', window.React1 !== React);

const {getKeyCode} = Events;

const {Field:{Factory:ErrorFactory}} = Errors;
const errorFactory = new ErrorFactory();
const error = errorFactory.make({NTIID: 'Fake ID', label: 'Fake Field'}, {Code: 'TooShort', message: 'Too Short'});


const {ErrorMessage, WarningMessage} = Plugins.Messages.components;
const {CharacterCounter} = Plugins.Counter.components;

const Users = [
	'Rosenda Ocon',
	'Vertie Rowell',
	'Denise Cogswell',
	'Orpha Sweat',
	'Tijuana Yin',
	'Diego Mota',
	'Lenita Crosley',
	'Julietta Carrier',
	'Odell Rego',
	'Junita Aikin',
	'Luana Vince',
	'Kiara Darrington',
	'Amal Brodnax',
	'Sherill Kolstad',
	'Allyn Dansereau',
	'Riva Adamek',
	'Ingeborg Paules',
	'Corrie Whiteley',
	'Davis Bainter',
	'Byron Kukla'
];

const userSearch = (search) => {
	if (!search) { return [...Users]; }

	const term = search.toLowerCase();

	return Users.filter(u => u.toLowerCase().indexOf(term) === 0);
};	

SuggestedUsers.propTypes = {
	search: PropTypes.string,
	applySuggestion: PropTypes.func
};
function SuggestedUsers ({search, applySuggestion}) {
	const users = userSearch((search || '').replace('@', ''));

	const onSelectedChange = (value) => applySuggestion(value);

	return (
		<List.Selectable controlledBy={global} onSelectedChange={onSelectedChange} autoFocus>
			{users.map((u) => (
				<List.Selectable.Item key={u} value={u}><span>{u}</span></List.Selectable.Item>
			))}
		</List.Selectable>
	);
}

const plugins = [
	// Plugins.EnsureFocusableBlock.create(),
	Plugins.LimitStyles.create({allow: STYLE_SET}),
	Plugins.LimitBlockTypes.create({allow: BLOCK_SET}),
	Plugins.ExternalLinks.create({allowedInBlockTypes: new Set([BLOCKS.UNSTYLED, BLOCKS.BLOCKQUOTE])}),
	Plugins.ContiguousEntities.create(),
	Plugins.Tagging.create([
		Plugins.Tagging.BuildStrategy({trigger: '#', type: Plugins.Tagging.HashTag}),
		Plugins.Tagging.BuildStrategy({
			trigger: '@',
			type: Plugins.Tagging.Mention,
			SuggestionsCmp: SuggestedUsers,
			suggestedOnly: true,
			allowWhiteSpace: true
		})
	])
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
