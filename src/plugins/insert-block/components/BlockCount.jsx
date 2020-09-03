import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';


export default class BlockCount extends React.Component {
	static propTypes = {
		predicate: PropTypes.func,
		group: PropTypes.bool,
		className: PropTypes.string,
		atomic: PropTypes.bool
	}


	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				getInsertBlockCount: PropTypes.func,
				getInsertAtomicBlockCount: PropTypes.func
			})
		})
	}


	get editorContext () {
		return this.context.editorContext || {};
	}


	get pluginContext () {
		return this.editorContext.plugins || {getInsertBlockCount: () => 0};
	}


	get blockCount () {
		const {predicate, group, atomic} = this.props;
		const {getInsertBlockCount, getInsertAtomicBlockCount} = this.pluginContext;

		if (atomic) {
			return getInsertAtomicBlockCount ? getInsertAtomicBlockCount(predicate, group) : 0;
		}

		return getInsertBlockCount ? getInsertBlockCount(predicate, group) : 0;
	}


	render () {
		const {className} = this.props;
		const {blockCount} = this;
		const cls = cx('insert-block-count', className, {isUsed: blockCount > 0});

		const label = blockCount > 0 ? blockCount : '';

		return (
			<div className={cls}>
				{label}
			</div>
		);
	}
}
