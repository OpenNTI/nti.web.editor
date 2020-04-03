import React from 'react';

import Base from './Base';

NoSuggestionTag.handlesStrategy = strat => !strat.hasSuggestions;
export default function NoSuggestionTag (props) {
	return (
		<Base {...props} />
	);
}