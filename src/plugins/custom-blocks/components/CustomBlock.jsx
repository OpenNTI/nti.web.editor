import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {DnD} from '@nti/web-commons';

import * as DragStore from '../DragStore';

import Styles from './CustomBlock.css';

const cx = classnames.bind(Styles);

const stop = e => e.stopPropagation();


CustomBlock.propTypes = {
	className: PropTypes.string,

	block: PropTypes.any,
	blockProps: PropTypes.shape({
		editorState: PropTypes.any
	}),

	draggable: PropTypes.bool,
	onDragStart: PropTypes.func,
	onDragEnd: PropTypes.func,

	children: PropTypes.any
};
export default function CustomBlock ({className, block, blockProps, draggable, onDragStart, onDragEnd, children}) {
	let content = (
		<div
			className={cx('custom-block', className)}
			draggable={draggable}
			onClick={stop}
		>
			{children}
		</div>
	);

	if (draggable) {
		content = (
			<DnD.Draggable
				{
					...DragStore.getDragPropsFor({
						block,
						editorState: blockProps?.editorState,
						onDragStart,
						onDragEnd
					})
				}
			>
				{content}
			</DnD.Draggable>
		);
	}

	return content;
}

