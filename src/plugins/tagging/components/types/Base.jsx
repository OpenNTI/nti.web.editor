import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './Base.css';

const cx = classnames.bind(Styles);

Base.propTypes = {
	className: PropTypes.string,
	strategy: PropTypes.shape({
		className: PropTypes.string
	}),
	children: PropTypes.any
};
export default function Base ({className, strategy, children}) {
	return (
		<span className={cx('tag-decorator', className, strategy.className)}>
			{children}
		</span>
	);
}
