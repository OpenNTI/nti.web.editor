import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Flyout } from '@nti/web-commons';
import { useForceUpdate } from '@nti/web-core';

import { getEntityData } from '../../link-utils';
import { getBestEntityDesc, removeEntity, updateEntityDesc } from '../utils';

import Styles from './Styles.css';
import LinkEditor from './LinkEditor';
import LinkInfo from './LinkInfo';

const cx = classnames.bind(Styles);

CustomLinkWrapper.propTypes = {
	children: PropTypes.any,

	entityKey: PropTypes.string,
	offsetKey: PropTypes.string,
	decoratedText: PropTypes.string,

	getEditorState: PropTypes.func,
	setEditorState: PropTypes.func,

	editor: PropTypes.shape({
		focus: PropTypes.func,
		onContentChange: PropTypes.func,
	}),

	store: PropTypes.shape({
		subscribeTo: PropTypes.func,
		SelectedEntityKey: PropTypes.string,
		EditingKey: PropTypes.string,
		getItem: PropTypes.func,
		setItem: PropTypes.func,
	}),
};
export default function CustomLinkWrapper({
	getEditorState,
	setEditorState,
	editor,
	store,
}) {
	const forceUpdate = useForceUpdate();
	const [entityDesc, setEntityDesc] = useState();

	const selectedEntityKey = store.getItem(store.SelectedEntityKey);
	const editingKey = store.getItem(store.EditingKey);

	const entityKey = selectedEntityKey ?? editingKey;

	useEffect(
		() =>
			store.subscribeTo(
				[store.SelectedEntityKey, store.EditingKey],
				forceUpdate
			),
		[store]
	);

	useEffect(() => {
		const bestEntityDesc = getBestEntityDesc(
			store.getItem(entityKey),
			getEditorState()
		);

		setEntityDesc(bestEntityDesc);
	}, [entityKey]);

	if (!entityDesc || !entityKey) {
		return null;
	}

	const { linkRef, offsetKey, decoratedText } = entityDesc;
	const entityData = {
		...getEntityData(entityKey, getEditorState),
		decoratedText,
	};

	const editing = Boolean(editingKey);

	const startEditing = () => store.setItem(store.EditingKey, entityKey);
	const stopEditing = () => {
		if (!entityData.href) {
			setEditorState(
				removeEntity(entityKey, offsetKey, getEditorState())
			);
		}

		store.setItem(store.EditingKey, null);
		store.setItem(store.SelectedEntityKey, null);
		editor?.focus();
	};

	const onRemove = () => (
		setEditorState(removeEntity(entityKey, offsetKey, getEditorState())),
		editor?.focus()
	);

	const onSave = data =>
		setEditorState(
			updateEntityDesc(data, entityDesc, getEditorState()),
			() => (
				store.setItem(store.EditingKey, null),
				store.setItem(store.SelectedEntityKey, null),
				editor?.focus()
			)
		);

	return (
		<Flyout.Aligned
			className={cx('custom-link-flyout')}
			alignTo={linkRef.current}
			visible
			arrow
			alignToArrow
			constrain
			focusOnOpen={false}
			reservedMargin={{ bottom: 75 }}
			horizontalAlign={Flyout.ALIGNMENTS.LEFT_OR_RIGHT}
		>
			{editing ? (
				<LinkEditor
					entityData={entityData}
					onCancel={stopEditing}
					onSave={onSave}
				/>
			) : (
				<LinkInfo
					entityData={entityData}
					onRemove={onRemove}
					onEdit={startEditing}
				/>
			)}
		</Flyout.Aligned>
	);
}
