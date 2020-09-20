import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {v4 as uuid} from 'uuid';
import {DnD} from '@nti/web-commons';

import ContextProvider from '../../../ContextProvider';
import {DRAG_DATA_TYPE} from '../Constants';

function isAllowedIn (editor = {}, type) {
	const {plugins} = editor;

	if (editor.readOnly || !plugins || !plugins.allowInsertBlock) { return false; }
	if (!type) { return true; }

	const {allowedBlockTypes, customBlockTypes} = plugins;

	return allowedBlockTypes.has(type) || customBlockTypes.has(type);
}

function useInsertionId () {
	const id = React.useRef();

	if (!id.current) {
		id.current = uuid();
	}

	return id.current;
}


InsertBlockButton.propTypes = {
	className: PropTypes.string,
	type: PropTypes.any,
	createBlock: PropTypes.func,
	createBlockProps: PropTypes.object,
	atomic: PropTypes.bool,
	disabled: PropTypes.bool,

	children: PropTypes.node,

	onDragStart: PropTypes.func,
	onDragEnd: PropTypes.func
};
export default function InsertBlockButton ({
	className,
	type,
	createBlock,
	createBlockProps,
	atomic,
	disabled,

	children,

	onDragStart,
	onDragEnd,

	...otherProps
}) {
	const editor = ContextProvider.useContext();
	const insertId = useInsertionId();

	const isAllowed = isAllowedIn(editor, type);

	const handleInsertion = (selection) => {
		const {getInsertMethod, getAtomicInsertMethod, getSelectedTextForInsertion} = editor?.plugins ?? {};

		if (atomic && getAtomicInsertMethod) {
			createBlock?.(
				getAtomicInsertMethod(selection),
				createBlockProps,
				getSelectedTextForInsertion()
			);
		} else if (getInsertMethod) {
			createBlock?.(
				getInsertMethod(selection),
				createBlockProps,
				getSelectedTextForInsertion()
			);
		}
	};

	const innerClick = () => handleInsertion();

	const innerDragStart = (e) => {
		editor?.plugins?.registerInsertHandler(insertId, handleInsertion);
		onDragStart?.(e);
	};

	const innerDragEnd = (e) => {
		editor?.plugins?.unregisterInsertHandler(insertId);
		onDragEnd?.(e);
	};

	return (
		<DnD.Draggable
			onDragStart={innerDragStart}
			onDragEnd={innerDragEnd}
			data={[
				{dataTransferKey: DRAG_DATA_TYPE, dataForTransfer: insertId},
				{dataTransferKey: 'text', dataForTransfer: 'Insert'}
			]}
		>
			<div {...otherProps} className={cx(className, {disabled: !isAllowed || disabled})} onClick={innerClick}>
				{children}
			</div>
		</DnD.Draggable>
	);
}
