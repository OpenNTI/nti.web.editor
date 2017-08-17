import React from 'react';

import StyleButton from './StyleButton';

export default function ItalicButton (props) {
	return (
		<StyleButton style={StyleButton.Styles.ITALIC} {...props} />
	);
}
