import React from 'react';
import PropTypes from 'prop-types';
import {DnD} from '@nti/web-commons';

import * as DragStore from '../DragStore';

CustomBlock.propTypes = {
	block: PropTypes.any,
	blockProps: PropTypes.shape({
		editorState: PropTypes.any
	}),

	draggable: PropTypes.bool,
	onDragStart: PropTypes.func,
	onDragEnd: PropTypes.func
};
export default function CustomBlock ({block, blockProps, draggable, onDragStart, onDragEnd, ...otherProps}) {

	let content = (<div {...otherProps} />);

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
				<div>
					{content}
				</div>
			</DnD.Draggable>
		);
	}

	return content;
}
