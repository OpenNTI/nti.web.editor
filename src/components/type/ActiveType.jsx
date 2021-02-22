import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const stop = e => (e.preventDefault(), e.stopPropagation());

export default class ActiveType extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		onClick: PropTypes.func,
		getString: PropTypes.func,
	};

	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				currentBlockType: PropTypes.string,
			}),
		}),
	};

	get getString() {
		return this.props.getString;
	}

	get editorContext() {
		return this.context.editorContext || {};
	}

	get pluginContext() {
		return this.editorContext.plugins || {};
	}

	get activeType() {
		const { currentBlockType } = this.pluginContext;

		return currentBlockType;
	}

	ref = React.createRef();

	getDOMNode() {
		return this.ref.current;
	}

	onMouseDown = e => {
		const { onClick } = this.props;

		if (onClick) {
			onClick();

			if (e) {
				e.preventDefault();
			}
		}
	};

	onClick = e => {
		const { onClick } = this.props;

		if (onClick) {
			stop(e);
		}
	};

	render() {
		const { className, ...otherProps } = this.props;
		const { activeType } = this;
		const cls = cx('draft-core-active-type', className, activeType, {
			empty: !activeType,
		});
		const label =
			activeType &&
			this.getString &&
			!this.getString.isMissing(activeType)
				? this.getString(activeType)
				: '';

		delete otherProps.getString;
		delete otherProps.onClick;
		delete otherProps.onMouseDown;

		return (
			<div
				ref={this.ref}
				className={cls}
				onClick={this.onClick}
				onMouseDown={this.onMouseDown}
				{...otherProps}
			>
				<span>{label}</span>
			</div>
		);
	}
}
