import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { DnD } from '@nti/web-commons';

import * as DragStore from '../DragStore';

import Styles from './CustomBlock.css';

const cx = classnames.bind(Styles);

const stop = e => e.stopPropagation();

CustomBlock.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,

	block: PropTypes.any,
	blockProps: PropTypes.shape({
		editorState: PropTypes.any,
		subscribeToRemoval: PropTypes.func,
	}),

	draggable: PropTypes.bool,
	onDragStart: PropTypes.func,
	onDragEnd: PropTypes.func,

	onRemoval: PropTypes.func,
};
export default function CustomBlock({
	className,
	children,

	block,
	blockProps,

	draggable,
	onDragStart,
	onDragEnd,

	onRemoval,
}) {
	let content = (
		<div className={cx('custom-block', className)} onClick={stop}>
			{children}
		</div>
	);

	React.useEffect(
		() => onRemoval && blockProps.subscribeToRemoval(onRemoval),
		[block, onRemoval]
	);

	if (draggable) {
		content = (
			<DnD.Draggable
				{...DragStore.getDragProps({
					block,
					editorState: blockProps?.editorState,
					onDragStart,
					onDragEnd,
				})}
			>
				{content}
			</DnD.Draggable>
		);
	}

	return content;
}
