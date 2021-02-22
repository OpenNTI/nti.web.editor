import React from 'react';
import PropTypes from 'prop-types';

import ClosedSuggestions from './types/ClosedSuggestions';
import OpenSuggestions from './types/OpenSuggestions';
import NoSuggestions from './types/NoSuggestions';

const Types = [ClosedSuggestions, OpenSuggestions, NoSuggestions];

Tag.propTypes = {
	strategy: PropTypes.shape({
		type: PropTypes.string,
		getId: PropTypes.func,
	}),
};
export default function Tag({ strategy, ...otherProps }) {
	const Type = Types.find(t => t.handlesStrategy(strategy));

	if (!Type) {
		throw new Error('Unknown tag strategy: ' + strategy.getId());
	}

	return <Type strategy={strategy} {...otherProps} />;
}
