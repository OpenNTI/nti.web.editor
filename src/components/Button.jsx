import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@nti/web-commons';

import ContextProvider from '../ContextProvider';

EditorButton.propTypes = {
	onClick: PropTypes.func
};
export default function EditorButton ({onClick:onClickProp, ...otherProps}) {
	const editor = ContextProvider.useContext();
	debugger;

	const onClick = async (...args) => {

		debugger;
		await onClickProp(...args);
		editor?.focusEditor();
	};

	return (
		<Button
			{...otherProps}
			disabled={otherProps.disabled || !editor}
			onClick={onClick}
		/>
	);
}