import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './Base.css';

const cx = classnames.bind(Styles);

Base.propTypes = {
	className: PropTypes.string,
	strategy: PropTypes.shape({
		DisplayCmp: PropTypes.any,
		displayClassName: PropTypes.string,
	}),
	children: PropTypes.any,
};
export default function Base(props) {
	const { className, strategy, children } = props;

	if (strategy?.DisplayCmp) {
		const Cmp = strategy.DisplayCmp;

		return <Cmp {...props} />;
	}

	return (
		<span
			className={cx(
				'tag-decorator',
				className,
				strategy.displayClassName
			)}
		>
			{children}
		</span>
	);
}
