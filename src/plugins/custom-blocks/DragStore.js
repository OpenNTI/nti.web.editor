import EventEmitter from 'events';

const TransferType = 'application/vnd.nextthought.app.dndmoveblock';

const Bus = new EventEmitter();
const Inflight = new Map();

export function getDragProps({ block, editorState, onDragStart, onDragEnd }) {
	const key = block.getKey();
	const data = [
		{ dataTransferKey: TransferType, dataForTransfer: key },
		{ dataTransferKey: 'text', dataForTransfer: 'Move Block' },
	];

	return {
		data,
		onDragStart: e => (
			Inflight.set(key, { block, editorState }), onDragStart?.(e)
		),
		onDragEnd: e => (Inflight.delete(key), onDragEnd?.(e)),
	};
}

export function getDataForDrop(dataTransfer) {
	const key = dataTransfer.data.getData(TransferType);

	return key && Inflight.get(key);
}

export function removeFromOtherEditors(block, thisEditor) {
	Bus.emit('remove', { block, thisEditor });
}

export function subscribeToRemoveFromOtherEditors(fn) {
	const handler = ({ block, thisEditor }) => fn(block, thisEditor);

	Bus.addListener('remove', handler);

	return () => Bus.removeListener('remove', handler);
}
