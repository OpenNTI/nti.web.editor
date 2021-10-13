import PropTypes from 'prop-types';

import { Button } from "@nti/web-core";

import ContextProvider from '../ContextProvider';

EditorButton.propTypes = {
	onClick: PropTypes.func,
};
export default function EditorButton({ onClick: onClickProp, ...otherProps }) {
	const editor = ContextProvider.useContext();

	const onClick = async (...args) => {
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
