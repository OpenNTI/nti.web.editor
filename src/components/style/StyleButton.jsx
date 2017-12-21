import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import {STYLES} from '../../Constants';

const clone = x => typeof x === 'string' ? x : React.cloneElement(x);
const stop = e => (e.preventDefault(), e.stopPropagation());

export const Styles = Object.freeze({
	CODE: STYLES.CODE,
	BOLD: STYLES.BOLD,
	ITALIC: STYLES.ITALIC,
	UNDERLINE: STYLES.UNDERLINE
});

export default class StyleButton extends React.Component {
	static Styles = Styles

	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				toggleInlineStyle: PropTypes.func.isRequired,
				currentInlineStyles: PropTypes.object,
				allowedInlineStyles: PropTypes.object
			})
		})
	}

	static propTypes = {
		className: PropTypes.string,
		children: PropTypes.any,
		style: PropTypes.oneOf(Object.values(Styles)).isRequired,
		shouldDisableForState: PropTypes.func
	}

	static defaultProps = {
		shouldDisableForState: () => { return false; }
	}

	get editorContext () {
		return this.context.editorContext || {};
	}

	get pluginContext () {
		return this.editorContext.plugins || {};
	}

	get isAllowed () {
		const {style, shouldDisableForState} = this.props;
		const {editorState, readOnly} = this.editorContext;
		const {allowedInlineStyles} = this.pluginContext;

		return allowedInlineStyles && allowedInlineStyles.has(style) && !readOnly && !shouldDisableForState(editorState);
	}


	get isCurrent () {
		const {style} = this.props;
		const {currentInlineStyles} = this.pluginContext;

		return currentInlineStyles && currentInlineStyles.has(style);
	}


	onMouseDown = (e) => {
		const {style} = this.props;
		const {toggleInlineStyle} = this.pluginContext;

		if (e) {
			e.preventDefault();
		}

		if (toggleInlineStyle) {
			toggleInlineStyle(style);
		}
	}


	render () {
		const {style = '_', className} = this.props;
		const {isAllowed, isCurrent} = this;
		const cls = cx('draft-core-style-button', className, {active: isCurrent, disabled: !isAllowed});
		const label = (style || '').toLowerCase();

		return (
			<button
				className={cls}
				onMouseDown={this.onMouseDown}//onCLisk is to late
				onClick={stop}
				data-style={label}
				aria-label={label}
			>
				{this.renderLabel(style)}
			</button>
		);
	}


	renderLabel (style) {
		const {children} = this.props;

		if (React.Children.count(children) > 0) {
			return React.Children.map(children, x => clone(x));
		}

		return (
			<i className={`icon-${style.toLowerCase()}`} />
		);
	}
}
