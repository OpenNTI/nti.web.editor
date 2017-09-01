import limitStyles from '../limit-styles';
import limitBlockTypes from '../limit-block-types';

export const create = () => {
	const stylesPlugin = limitStyles.create({allowed: new Set()});
	const blocksPlugin = limitBlockTypes.create({allowed: new Set()});

	return {
		composes: [
			stylesPlugin,
			blocksPlugin
		]
	};
};
