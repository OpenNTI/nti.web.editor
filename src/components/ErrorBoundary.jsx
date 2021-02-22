import React from 'react';

export default class ErrorBoundary extends React.Component {
	// static getDerivedStateFromError (error) {
	// 	// Update state so the next render will show the fallback UI.
	// 	return { hasError: true };
	// }

	componentDidCatch(error, errorInfo) {
		// eslint-disable-next-line no-console
		console.error('An error occurred...', error, errorInfo);
	}

	render() {
		return React.Children.only(this.props.children);
	}
}
