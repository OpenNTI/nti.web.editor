import './LimitOverlay.scss';
import React from 'react';
import PropTypes from 'prop-types';

LimitOverlay.propTypes = {
	children: PropTypes.node
};
export default function LimitOverlay ({children}) {
	return (
		<span className="draft-core-over-limit">{children}</span>
	);
}
