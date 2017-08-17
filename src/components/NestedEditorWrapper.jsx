import React from 'react';
import PropTypes from 'prop-types';

//Inspired by: https://github.com/draft-js-plugins/draft-js-plugins/blob/master/legacy/draft-js-table-plugin/src/components/nested-editor.js
//TODO: figure out a better way to nest draft-js editors

const stop = e => e.stopPropagation();


export default class NestedEditorWrapper extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		onMouseDown: PropTypes.func,
		onClick: PropTypes.func
	}

	events = {
		selectionchange: stop,
		focusin: stop,
		focusout: stop,
		click: (e) => {
			const {onClick} = this.props;

			stop(e);

			if (onClick) {
				onClick(e);
			}
		},
		mouseup: stop,
		mousedown: (e) => {
			const {onMouseDown} = this.props;

			stop(e);

			if (onMouseDown) {
				onMouseDown(e);
			}
		}
	}


	forEachEvent (fn) {
		Object.keys(this.events).forEach(name => fn(name, this.events[name]));
	}


	onKeyDown = (e) => {
		if (e.keyCode === 38) {
			stop(e);
		} else if (e.keyCode === 40) {
			stop(e);
		} else if (e.keyCode === 8) {
			stop(e);
		}
	}


	attachWrapperRef = (wrapper) => {
		if (this.unsubscribe) { this.unsubscribe(); }

		if (!wrapper) {
			return;
		}

		this.unsubscribe = () => {
			this.forEachEvent((name, handler) => {
				wrapper.removeEventListener(name, handler, false);
				wrapper.addEventListener(name, handler, true);
			});
		};

		this.forEachEvent((name, handler) => {
			wrapper.addEventListener(name, handler, false);
			wrapper.addEventListener(name, handler, true);
		});
	}


	render () {
		const {children, ...otherProps} = this.props;

		delete otherProps.onMouseDown;
		delete otherProps.onClick;

		return (
			<div {...otherProps} ref={this.attachWrapperRef} >
				{children}
			</div>
		);
	}
}
