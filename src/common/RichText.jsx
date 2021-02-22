import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { BLOCKS, STYLES } from '../Constants';
import { HTML as HTMLParser } from '../parsers';
import Editor from '../components/Editor';
import * as StyleButtons from '../components/style';
import ContextProvider from '../ContextProvider';
import * as Plugins from '../plugins';

import Styles from './RichText.css';

const cx = classnames.bind(Styles);

const Initial = Symbol('Initial');

const toDraftState = x => HTMLParser.toDraftState(x);
const fromDraftState = x => HTMLParser.fromDraftState(x);

const getEditorPlugins = () => [
	Plugins.LimitBlockTypes.create({ allow: new Set([BLOCKS.UNSTYLED]) }),
	Plugins.LimitStyles.create({
		allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE]),
	}),

	Plugins.Links.AutoLink.create(),
	Plugins.Links.CustomLinks.create(),

	Plugins.KeepFocusInView.create(),
	Plugins.ContiguousEntities.create(),
];

RichTextEditor.propTypes = {
	className: PropTypes.string,
	value: PropTypes.string,
	onContentChange: PropTypes.func,
};
export default function RichTextEditor({
	className,
	value,
	onContentChange: onContentChangeProp,
	...otherProps
}) {
	const [editorRef, setEditorRef] = React.useState();

	const contentRef = React.useRef(Initial);
	const [editorState, setEditorState] = React.useState(null);
	const [plugins, setPlugins] = React.useState(null);
	const settingUp = !editorState || !plugins;

	React.useEffect(() => {
		if (contentRef.current === Initial || value !== contentRef.current) {
			setEditorState(toDraftState(value));
		}
	}, [value]);

	React.useEffect(() => {
		setPlugins(getEditorPlugins());
	}, []);

	const onContentChange = newEditorState => {
		const newContent = fromDraftState(newEditorState)[0];

		contentRef.current = newContent;
		onContentChangeProp?.(newContent, newEditorState);
	};

	return (
		<div className={cx('rich-text-editor', className)}>
			{!settingUp && (
				<Editor
					ref={setEditorRef}
					plugins={plugins}
					className={cx('editor')}
					editorState={editorState}
					onContentChange={onContentChange}
					{...otherProps}
				/>
			)}
			{editorRef && (
				<ContextProvider editor={editorRef}>
					<div className={cx('controls')}>
						<StyleButtons.BoldButton
							plain
							className={cx('button')}
							activeClassName={cx('active')}
						/>
						<StyleButtons.ItalicButton
							plain
							className={cx('button')}
							activeClassName={cx('active')}
						/>
						<StyleButtons.UnderlineButton
							plain
							className={cx('button')}
							activeClassName={cx('active')}
						/>
					</div>
				</ContextProvider>
			)}
		</div>
	);
}
