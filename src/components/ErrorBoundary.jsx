import React from 'react';

import { reportError } from '@nti/web-client';
export default class ErrorBoundary extends React.Component {
	// static getDerivedStateFromError (error) {
	// 	reportError(error);
	// 	// Update state so the next render will show the fallback UI.
	// 	return { hasError: true };
	// }

	componentDidCatch(error, errorInfo) {
		reportError(error);
		// eslint-disable-next-line no-console
		console.error('An error occurred...', error, errorInfo);
	}

	render() {
		return React.Children.only(this.props.children);
	}
}
