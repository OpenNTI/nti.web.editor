import limitStyles from '../limit-styles';
import limitBlockTypes from '../limit-block-types';

export const create = () => {
	const stylesPlugin = limitStyles.create({allow: new Set()});
	const blocksPlugin = limitBlockTypes.create({allow: new Set()});

	return {
		composes: [
			stylesPlugin,
			blocksPlugin
		]
	};
};
