import { create as CreateDecorate } from '../decorate';

import { ApplyAutoLinks } from './utils';

export const create = (config = {}) => {
	let prevHash = {};

	return {
		plugins: [CreateDecorate()],

		onChange(editorState) {
			const { editorState: linkedState, hash } = ApplyAutoLinks.autoLink(
				editorState,
				prevHash,
				config
			);

			prevHash = hash;

			return linkedState;
		},
	};
};
