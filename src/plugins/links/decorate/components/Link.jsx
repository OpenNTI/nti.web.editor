import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './Link.css';

const cx = classnames.bind(Styles);

function getEntityData (entityKey, getEditorState) {
	return getEditorState().getCurrentContent().getEntity(entityKey).getData();
}

Link.propTypes = {
	entityKey: PropTypes.string,
	getEditorState: PropTypes.func,

	children: PropTypes.any
};
export default function Link ({entityKey, getEditorState, children}) {
	const entityData = getEntityData(entityKey, getEditorState);
	const {href} = entityData ?? {};

	return (
		<a href={href} className={cx('editor-link')}>
			{children}
		</a>
	);
}