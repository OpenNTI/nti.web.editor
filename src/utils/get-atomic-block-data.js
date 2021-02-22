import { BLOCKS } from '../Constants';

export default function getAtomicBlockData(block, editorState, onlyData) {
	if (block.getType() !== BLOCKS.ATOMIC) {
		return null;
	}

	const blockData = block.getData();

	const entityKey = block.getEntityAt(0);
	const entity = entityKey
		? editorState.getCurrentContent().getEntity(entityKey)
		: null;

	const data = {
		...(blockData?.toJS() ?? {}),
		...(entity?.getData() ?? {}),
	};

	if (onlyData) {
		return data;
	}

	return {
		...data,
		type: entity?.getType() ?? void 0,
		mutability: entity?.getMutability() ?? void 0,
	};
}
