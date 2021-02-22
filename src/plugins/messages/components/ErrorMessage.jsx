import React from 'react';
import PropTypes from 'prop-types';
import { Errors } from '@nti/web-commons';

const {
	Field: { Component: ErrorCmp },
} = Errors;

export default class ErrorMessage extends React.Component {
	static propTypes = {
		error: PropTypes.any,
	};

	static contextTypes = {
		editorContext: PropTypes.shape({
			focusEditor: PropTypes.func,
		}),
	};

	get editorContext() {
		return this.context.editorContext || {};
	}

	focusEditor = () => {
		const { focusEditor } = this.editorContext;

		if (focusEditor) {
			focusEditor();
		}
	};

	render() {
		const { error, ...otherProps } = this.props;

		return error ? (
			<ErrorCmp
				{...otherProps}
				error={error}
				onFocus={this.focusEditor}
			/>
		) : null;
	}
}
