import './LinkButton.scss';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const clone = x => typeof x === 'string' ? x : React.cloneElement(x);
const stop = e => (e.preventDefault(), e.stopPropagation());

export default class LinkButton extends React.Component {
	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				toggleLink: PropTypes.func.isRequired,
				currentLink: PropTypes.string,
				allowLinks: PropTypes.bool,
				isEditingLink: PropTypes.bool
			})
		})
	}

	static propTypes = {
		className: PropTypes.string,
		activeClassName: PropTypes.string,
		children: PropTypes.any,
		plain: PropTypes.bool
	}


	get editorContext () {
		return this.context.editorContext || {};
	}


	get pluginContext () {
		return this.editorContext.plugins || {};
	}


	get isAllowed () {
		const {allowLinks} = this.pluginContext;
		const {readOnly} = this.editorContext;

		return allowLinks && !readOnly;
	}


	get isCurrent () {
		const {currentLink} = this.pluginContext;

		return !!currentLink;
	}


	get isEditingLink () {
		const {isEditingLink} = this.pluginContext;

		return isEditingLink;
	}


	onMouseDown = (e) => {
		const {toggleLink} = this.pluginContext;

		if (e) {
			e.preventDefault();
		}

		if (toggleLink) {
			toggleLink();
		}
	}


	render () {
		const {className, activeClassName = 'active', plain} = this.props;
		const {isAllowed, isEditingLink} = this;
		const cls = cx('draft-core-link-button', className, {[activeClassName]: isEditingLink, disabled: !isAllowed, plain});

		return (
			<button
				className={cls}
				onMouseDown={this.onMouseDown}//onClick is to late
				onClick={stop}
				data-style="link"
				aria-label="link"
			>
				{this.renderLabel()}
			</button>
		);
	}


	renderLabel () {
		const {children} = this.props;

		if (React.Children.count(children) > 0) {
			return React.Children.map(children, x => clone(x));
		}

		return (
			<i className="icon-hyperlink" />
		);
	}
}
