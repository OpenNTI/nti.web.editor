import {BLOCKS} from '../Constants';

export default function getAtomicBlockData (block, editorState) {
	if (block.getType() !== BLOCKS.ATOMIC) { return null; }

	const blockData = block.getData();

	const entityKey = block.getEntityAt(0);
	const entity = entityKey ? editorState.getCurrentContent().getEntity(entityKey) : null;

	return {
		...(blockData?.toJS() ?? {}),
		...(entity?.getData() ?? {}),
		type: entity?.getType() ?? void 0,
		mutability: entity?.getMutability() ?? void 0
	};
}