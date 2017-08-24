import React from 'react';
import PropTypes from 'prop-types';

Anchor.propTypes = {
	entityKey: PropTypes.string,
	contentState: PropTypes.shape({
		getEntity: PropTypes.func
	}),
	children: PropTypes.node
};
export default function Anchor ({entityKey, contentState, children}) {
	const entity = contentState.getEntity(entityKey);
	const data = entity && entity.getData();
	const {href} = data || {};

	return (
		<a href={href} className="draft-core-inline-link-anchor">
			{children}
		</a>
	);
}
