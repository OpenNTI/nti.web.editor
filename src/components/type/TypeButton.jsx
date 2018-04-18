import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import {scoped} from '@nti/lib-locale';

import {BLOCKS} from '../../Constants';

const stop = e => (e.preventDefault(), e.stopPropagation());

export const Types = Object.freeze({
	[BLOCKS.ATOMIC]: BLOCKS.ATOMIC,
	[BLOCKS.BLOCKQUOTE]: BLOCKS.BLOCKQUOTE,
	[BLOCKS.CODE]: BLOCKS.CODE,
	[BLOCKS.HEADER_FIVE]: BLOCKS.HEADER_FIVE,
	[BLOCKS.HEADER_FOUR]: BLOCKS.HEADER_FOUR,
	[BLOCKS.HEADER_ONE]: BLOCKS.HEADER_ONE,
	[BLOCKS.HEADER_SIX]: BLOCKS.HEADER_SIX,
	[BLOCKS.HEADER_THREE]: BLOCKS.HEADER_THREE,
	[BLOCKS.HEADER_TWO]: BLOCKS.HEADER_TWO,
	[BLOCKS.ORDERED_LIST_ITEM]: BLOCKS.ORDERED_LIST_ITEM,
	[BLOCKS.PULLQUOTE]: BLOCKS.PULLQUOTE,
	[BLOCKS.UNORDERED_LIST_ITEM]: BLOCKS.UNORDERED_LIST_ITEM,
	[BLOCKS.UNSTYLED]: BLOCKS.UNSTYLED
});

const t = scoped('web-editor.components.type.TypeButton', Types);

export default class TypeButton extends React.Component {
	static Types = Types

	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				toggleBlockType: PropTypes.func.isRequired,
				currentBlockType: PropTypes.string,
				allowedBlockTypes: PropTypes.object
			})
		})
	}

	static propTypes = {
		className: PropTypes.string,
		type: PropTypes.oneOf(Object.values(Types)).isRequired,
		label: PropTypes.string,
		children: PropTypes.node,
		getString: PropTypes.func,
		plain: PropTypes.bool,
		checkmark: PropTypes.bool,
		inlineStyle: PropTypes.bool,
		onMouseDown: PropTypes.func
	}

	get editorContext () {
		return this.context.editorContext || {};
	}


	get pluginContext () {
		return this.editorContext.plugins || {};
	}


	get getString () {
		const {getString} = this.props;

		return getString ? t.override(getString) : t;
	}

	get isAllowed () {
		const {type} = this.props;
		const {allowedBlockTypes} = this.pluginContext;

		return allowedBlockTypes && allowedBlockTypes.has(type);
	}

	get isCurrent () {
		const {type} = this.props;
		const {currentBlockType} = this.pluginContext;

		return type === currentBlockType;
	}


	onMouseDown = (e) => {
		const {type, onMouseDown} = this.props;
		const {toggleBlockType} = this.pluginContext;

		if (e) {
			e.preventDefault();
		}

		if (toggleBlockType) {
			toggleBlockType(type);
		}

		if (onMouseDown) {
			onMouseDown();
		}
	}


	render () {
		const {type = '_', className, plain, checkmark, inlineStyle} = this.props;
		const {isAllowed, isCurrent} = this;
		const cls = cx('draft-core-type-button', className, type, {inline: inlineStyle, active: isCurrent, disabled: !isAllowed, plain, checkmark});

		return (
			<button
				className={cls}
				onMouseDown={this.onMouseDown}
				onClick={stop}
				data-type={type}
				aria-label={type}
			>
				{this.renderLabel(type)}
			</button>
		);
	}


	renderLabel = (type) => {
		const {label, children} = this.props;
		const child = children && React.Children.only(children);

		if (child) {
			return child;
		}

		return (
			<span>{label || this.getString(type)}</span>
		);
	}
}
