import React from 'react';
import PropTypes from 'prop-types';
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

function toggleInlineStyle (style, context) {
	return context?.plugins?.toggleInlineStyle?.(style);
}

StyleButton.Styles = Styles;
StyleButton.propTypes = {
	className: PropTypes.string,
	activeClassName: PropTypes.string,
	disabledClassName: PropTypes.string,
	children: PropTypes.any,
	style: PropTypes.oneOf(Object.values(Styles)).isRequired,
	shouldDisableForState: PropTypes.func,
	plain: PropTypes.bool
};
export default function StyleButton ({
	className,
	activeClassName = 'active',
	disabledClassName = 'disabled',
	children,
	style,
	plain,
	shouldDisableForState = () => false
}) {
	const editorContext = ContextProvider.useContext();

	const isAllowed = isStyleAllowed(style, editorContext, shouldDisableForState);
	const isCurrent = isCurrentStyle(style, editorContext);

	const onMouseDown = (e) => {
		e?.preventDefault?.();
		toggleInlineStyle(style, editorContext);
	};

	const cls = cx('draft-core-style-button', className, {[activeClassName]: isCurrent, [disabledClassName]: !isAllowed, plain});
	const label = (style || '').toLowerCase();

	return (
		<button className={cls} onMouseDown={onMouseDown} onClick={stop} data-style={label} aria-label={label}>
			{
				React.Children.count(children) > 0 ?
					React.Children.map(children, x => clone(x)) :
					(<i className={`icon-${label}`} />)
			}
		</button>
	);
}
