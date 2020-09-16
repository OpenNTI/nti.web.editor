import PropTypes from 'prop-types';
import PluginEditor from 'draft-js-plugins-editor';

class BaseEditor extends PluginEditor {
	static propTypes = {
		...PluginEditor.propTypes,
		onSetReadOnly: PropTypes.func
	};

	get readOnly () { return this.props.readOnly || this.state.readOnly; }

	/**
	 * This is an override is for us handling the readOnly prop so context provider knows to update.
	 * We are handling what setReadOnly does in the PluginEditor. That will need to be monitored if there
	 * are changes to setReadOnly.
	 * https://github.com/draft-js-plugins/draft-js-plugins/blob/master/draft-js-plugins-editor/src/Editor/index.js#L110
	 * @param {boolean} readOnly editor readOnly state
	 * @memberof BaseEditor
	 * @return {void} void
	 */
	setReadOnly = readOnly => {
		const { onSetReadOnly } = this.props;
		const { readOnly: oldReadOnly } = this.state;

		if (readOnly !== oldReadOnly) {
			this.setState({ readOnly }, () => {
				if (onSetReadOnly) {
					onSetReadOnly(readOnly);
				}
			});
		}
	};
}

export default BaseEditor;
