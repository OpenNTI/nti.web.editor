import React from 'react';
import PropTypes from 'prop-types';
import {Errors} from 'nti-web-commons';

const {Field:{Component:ErrorCmp}} = Errors;

export default class ErrorMessage extends React.Component {
	static propTypes = {
		error: PropTypes.any
	}

	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				messages: PropTypes.shape({
					focusEdutor: PropTypes.func
				})
			})
		})
	}

	get editorContext () {
		return this.context.editorContext || {};
	}

	get pluginContext () {
		return this.editorContext.plugins || {};
	}

	get messageContext () {
		return this.pluginContext.messages || {};
	}

	focusEditor = () => {
		debugger;
		const {focusEditor} = this.messageContext;

		if (focusEditor) {
			focusEditor();
		}
	}

	render () {
		const {error, ...otherProps} = this.props;

		return error ?
			(<ErrorCmp {...otherProps} error={error} onFocus={this.focusEditor} />) :
			null;
	}
}
