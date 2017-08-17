import React from 'react';

import StyleButton from './StyleButton';

export default function BoldButton (props) {
	return (
		<StyleButton style={StyleButton.Styles.BOLD} {...props} />
	);
}
