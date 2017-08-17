import {fixStateForAllowed} from './utils';

export default {
	create: () => {
		return {
			onChange (editorState) {
				return fixStateForAllowed(editorState);
			}
		};
	}
};
