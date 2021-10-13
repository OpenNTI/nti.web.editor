import PropTypes from 'prop-types';

import ErrorMessage from './ErrorMessage';

WarningMessage.propTypes = {
	warning: PropTypes.any,
};
export default function WarningMessage({ warning, ...otherProps }) {
	return <ErrorMessage {...otherProps} error={warning} isWarning />;
}
