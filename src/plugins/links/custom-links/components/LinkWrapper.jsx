import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { useForceUpdate } from '@nti/web-core';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

LinkWrapper.propTypes = {
	children: PropTypes.any,

	entityKey: PropTypes.string,
	offsetKey: PropTypes.string,
	decoratedText: PropTypes.string,

	store: PropTypes.shape({
		EditingKey: PropTypes.string,
		SelectedKey: PropTypes.string,
		subscribeTo: PropTypes.func,
		setItem: PropTypes.func,
	}),
};
export default function LinkWrapper({
	children,
	entityKey,
	offsetKey,
	decoratedText,
	store,
}) {
	const linkRef = useRef();
	const forceUpdate = useForceUpdate();

	useEffect(() => {
		const existing = store.getItem(entityKey) || [];
		const entityDesc = {
			linkRef,
			entityKey,
			offsetKey,
			decoratedText,
		};

		store.setItem(entityKey, [...existing, entityDesc]);

		return () => {
			const current = store.getItem(entityKey) || [];
			const newCmps = current.filter(x => x !== entityDesc);

			if (newCmps.length) {
				store.setItem(entityKey, newCmps);
			} else {
				store.clearItem(entityKey);
			}
		};
	}, [entityKey, offsetKey, decoratedText]);

	useEffect(
		() =>
			store.subscribeTo(
				[store.EditingKey, store.SelectedKey],
				forceUpdate
			),
		[store]
	);

	const editingEntity = store.getItem(store.EditingKey);
	const selectedEntity = store.getItem(store.SelectedKey);

	const isEditing = editingEntity === entityKey;
	const isSelected = selectedEntity === entityKey;

	return React.cloneElement(React.Children.only(children), {
		className: cx({ focused: isSelected, editing: isEditing }),
		ref: linkRef,
	});
}
