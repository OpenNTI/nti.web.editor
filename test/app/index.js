/*eslint no-console: 0*/
// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

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


const plugins = [
	Plugins.LimitStyles.create({allowed: STYLE_SET}),
	Plugins.LimitBlockTypes.create({allowed: BLOCK_SET})
];

class Test extends React.Component {
	state = {editor: null}

	attachEditorRef = x => this.setState({editor: x})


	render () {
		const {editor} = this.state;

		return (
			<div>
				<Editor ref={this.attachEditorRef} plugins={plugins} />
				{editor && (
					<ContextProvider editor={editor}>
						<div>
							<BoldButton />
							<ItalicButton />
							<UnderlineButton />
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
