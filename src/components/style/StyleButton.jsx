import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import {STYLES} from '../../Constants';
import ContextProvider from '../../ContextProvider';

const clone = x => typeof x === 'string' ? x : React.cloneElement(x);
const stop = e => (e.preventDefault(), e.stopPropagation());

const Styles = Object.freeze({
	CODE: STYLES.CODE,
	BOLD: STYLES.BOLD,
	ITALIC: STYLES.ITALIC,
	UNDERLINE: STYLES.UNDERLINE
});

function isStyleAllowed (style, context, shouldDisableForState) {
	const {editorState, readOnly, plugins} = context;

	return plugins?.allowedInlineStyles?.has(style) && !readOnly && !shouldDisableForState(editorState);
}

function isCurrentStyle (style, context) {
	return context?.plugins?.currentInlineStyles?.has(style);
}

StyleButton.Styles = Styles;
StyleButton.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	style: PropTypes.oneOf(Object.values(Styles)).isRequired,
	shouldDisableForState: PropTypes.func
};
export default function StyleButton ({className, children, style, shouldDisableForState = () => false}) {
	const editorContext = ContextProvider.useContext();

	console.log('Style BUTTON Updating: ', editorContext);

	const isAllowed = isStyleAllowed(style, editorContext, shouldDisableForState);
	const isCurrent = isCurrentStyle(style, editorContext);

	const onMouseDown = () => {

	};

	const cls = cx('draft-core-style-button', className, {active: isCurrent, disabled: !isAllowed});
	const label = (style || '').toLowerCase();

	return (
		<>
			<button className={cls} onMouseDown={onMouseDown} onClick={stop} data-style={label} aria-label={label}>
				{
					React.Children.count(children) > 0 ?
						React.Children.map(children, x => clone(x)) :
						(<i className={`icon-${label}`} />)
				}
			</button>
			<ContextProvider.Consumer>
				{(context) => {
					console.log('NEW STYLE CONTEXT: ', context);
				}}
			</ContextProvider.Consumer>
		</>
	);
}
