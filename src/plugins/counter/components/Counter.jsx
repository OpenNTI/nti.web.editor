import './Counter.scss';
import PropTypes from 'prop-types';
import cx from 'classnames';

Counter.propTypes = {
	className: PropTypes.string,
	limit: PropTypes.number,
	count: PropTypes.number,
	over: PropTypes.bool,
	showLimit: PropTypes.bool,
};
export default function Counter({ className, limit, count, over, showLimit }) {
	const cls = cx('draft-core-counter', className, { over });

	return (
		<div className={cls}>
			<span className="count">{count}</span>
			{showLimit && <span className="separator">/</span>}
			{showLimit && <span className="limit">{limit}</span>}
		</div>
	);
}
