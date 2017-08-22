import React from 'react';
import PropTypes from 'prop-types';

import Counter from './Counter';

export default class CharacterCounter extends React.Component {
	static contextTypes = {
		editorContext: PropTypes.shape({
			plugins: PropTypes.shape({
				counter: PropTypes.shape({
					character: PropTypes.shape({
						limit: PropTypes.number,
						count: PropTypes.number
					})
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

	get counterContext () {
		return this.pluginContext.counter || {};
	}

	get characterContext () {
		return this.counterContext.character || {};
	}


	render () {
		const {limit, count, over} = this.characterContext;

		return (
			<Counter {...this.props} limit={limit} count={count} over={over} />
		);
	}
}
