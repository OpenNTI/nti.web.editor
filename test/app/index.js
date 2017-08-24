/*eslint no-console: 0*/
// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Errors} from 'nti-web-commons';

import {
	Editor,
	ContextProvider,
	BoldButton,
	ItalicButton,
	UnderlineButton,
	ActiveType,
	TypeButton,
	Plugins,
	STYLE_SET,
	BLOCK_SET,
	BLOCKS
} from '../../src';
// import RSTTest from '../../src/RST/test';

// import 'normalize.css';
import 'nti-style-common/fonts.scss';
import 'nti-style-common/all.scss';
import 'nti-web-commons/lib/index.css';


const {Field:{Factory:ErrorFactory}} = Errors;
const errorFactory = new ErrorFactory();
const error = errorFactory.make({NTIID: 'Fake ID', label: 'Fake Field'}, {Code: 'TooShort', message: 'Too Short'});


const {ErrorMessage, WarningMessage} = Plugins.Messages.components;
const {CharacterCounter} = Plugins.Counter.components;

const plugins = [
	Plugins.LimitStyles.create({allowed: STYLE_SET}),
	Plugins.LimitBlockTypes.create({allowed: BLOCK_SET}),
	Plugins.Messages.create(),
	Plugins.Counter.create({character: {limit: 10}}),
	Plugins.InlineLinks.create()
];

class Test extends React.Component {
	state = {editor: null}

	attachEditorRef = x => this.setState({editor: x})


	onFocusToEnd = () => {
		const {editor} = this.state;

		if (editor) {
			editor.focusToEnd();
		}
	}


	render () {
		const {editor} = this.state;

		return (
			<div>
				<Editor ref={this.attachEditorRef} plugins={plugins} />
				{editor && (
					<ContextProvider editor={editor}>
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
							</div>
							<div>
								<span>Active:</span>
								<ActiveType />
							</div>
							<div>
								<TypeButton type={BLOCKS.UNSTYLED} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_ONE} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_TWO} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_THREE} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_FOUR} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_FIVE} plain checkmark />
								<TypeButton type={BLOCKS.HEADER_SIX} plain checkmark />
								<TypeButton type={BLOCKS.ORDERED_LIST_ITEM} plain checkmark />
								<TypeButton type={BLOCKS.UNORDERED_LIST_ITEM} plain checkmark />
							</div>
						</div>
					</ContextProvider>
				)}
			</div>
		);
	}
}


ReactDOM.render(
	<Test />,
	document.getElementById('content')
);
