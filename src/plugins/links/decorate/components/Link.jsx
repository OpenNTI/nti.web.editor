import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import {getEntityData} from '../../link-utils';

import Styles from './Link.css';

const cx = classnames.bind(Styles);

Link.propTypes = {
	entityKey: PropTypes.string,
	getEditorState: PropTypes.func,

	children: PropTypes.any,
	linkRef: PropTypes.any,
};
function Link ({className, entityKey, getEditorState, children, linkRef}) {
	const entityData = getEntityData(entityKey, getEditorState);
	const {href} = entityData ?? {};

	return (
		<a href={href} className={cx('editor-link', className)} ref={linkRef}>
			{children}
		</a>
	);
}

const LinkRef = (props, ref) => (<Link {...props} linkRef={ref} />);
export default React.forwardRef(LinkRef);