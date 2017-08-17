import React from 'react';
import PropTypes from 'prop-types';

const stop = e => e.preventDefault();

export default class PreventStealingFocus extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		onMouseDown: PropTypes.func
	}


	attachRef = x => this.ref = x

	getDomNode () {
		return this.ref;
	}


	onMouseDown = (e) => {
		const {onMouseDown} = this.props;

		stop(e);

		if (onMouseDown) {
			onMouseDown(e);
		}
	}


	render () {
		const {children, ...otherProps} = this.props;

		return (
			<div {...otherProps} ref={this.attachRef} onMouseDown={this.onMouseDown}>
				{children}
			</div>
		);
	}
}
