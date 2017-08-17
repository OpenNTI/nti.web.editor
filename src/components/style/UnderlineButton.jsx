import React from 'react';

import StyleButton from './StyleButton';

export default function UnderlineButton (props) {
	return (
		<StyleButton style={StyleButton.Styles.UNDERLINE} {...props} />
	);
}
