import { EditorState } from 'draft-js';

import { HANDLED, NOT_HANDLED } from '../Constants';

import {
	setBlockData,
	removeBlock,
	MoveBlock,
	BlockIndex,
	BlocksToBeRemoved,
} from './utils';
import CustomBlock from './components/CustomBlock';
import * as DragStore from './DragStore';

const RemovalListeners = new Map();

function allowRemoval(key) {
	const listener = RemovalListeners.get(key) ?? (() => true);

	try {
		return listener();
	} catch (e) {
		return false;
	}
}

export default {
	CustomBlock,
	create: (config = {}) => {
		const {
			customBlocks = [],
			customRenderers = [],
			customStyles = [],
			blockProps,
		} = config;

		let extraProps = blockProps || {};
		let unsubscribe = null;

		for (let block of customBlocks) {
			if (block.component) {
				customRenderers.push(block);
			}

			if (block.className) {
				customStyles.push(block);
			}
		}

		return {
			initialize({ setEditorState, getEditorState, getEditorRef }) {
				unsubscribe = DragStore.subscribeToRemoveFromOtherEditors(
					() => {
						//TODO: remove the block if it was in this editor and is no longer
					}
				);
			},

			willUnmount() {
				unsubscribe?.();
			},

			handleKeyCommand(command, editorState) {
				const toRemove = BlocksToBeRemoved.command(
					command,
					editorState
				);

				//If any of the blocks getting removed are blocked from removal,
				//stop the command
				return toRemove.every(key => allowRemoval(key))
					? NOT_HANDLED
					: HANDLED;
			},

			handleBeforeInput(chars, editorState) {
				const toRemove = BlocksToBeRemoved.beforeInput(
					chars,
					editorState
				);

				//If any of the blocks getting removed are blocked from removal,
				//stop the command
				return toRemove.every(key => allowRemoval(key))
					? NOT_HANDLED
					: HANDLED;
			},

			handleDrop(
				selection,
				dataTransfer,
				type,
				{ getEditorState, setEditorState, getEditorRef }
			) {
				const dragData = DragStore.getDataForDrop(dataTransfer);

				const newEditorState =
					dragData &&
					MoveBlock.toSelection(
						dragData,
						selection,
						getEditorState(),
						() =>
							DragStore.removeFromOtherEditors(
								dragData,
								getEditorRef()
							)
					);

				if (newEditorState) {
					setEditorState(newEditorState);
					return HANDLED;
				}

				return NOT_HANDLED;
			},

			setExtraProps: (props = {}) => {
				extraProps = props;
			},

			mergeExtraProps: (props = {}) => {
				extraProps = { ...extraProps, ...props };
			},

			getNestedState(block) {
				for (let renderer of customRenderers) {
					if (renderer.getNestedState) {
						return renderer.getNestedState(block);
					}
				}
			},

			blockRendererFn: (contentBlock, pluginProps) => {
				const { getEditorState, setEditorState } = pluginProps;
				const editorState = getEditorState();

				let pendingUpdates = null;

				for (let renderer of customRenderers) {
					if (renderer.handlesBlock(contentBlock, editorState)) {
						return {
							component: renderer.component,
							editable: renderer.editable,
							props: {
								...(renderer.props || {}),
								...(pluginProps || {}),
								...(extraProps || {}),
								editorState,

								index: BlockIndex.getIndex(
									contentBlock,
									editorState
								),
								indexOfType: BlockIndex.getIndex(
									contentBlock,
									editorState,
									renderer.handlesBlock
								),
								isFirst: BlockIndex.isFirst(
									contentBlock,
									editorState
								),
								isLast: BlockIndex.isLast(
									contentBlock,
									editorState
								),

								//If the fn returns false it can stop the block removal
								subscribeToRemoval: fn => {
									const key = contentBlock.getKey();

									RemovalListeners.set(key, fn);

									return () => RemovalListeners.delete(key);
								},

								moveBlockUp: () => {
									const currentEditorState = getEditorState();
									const newEditorState = MoveBlock.up(
										contentBlock,
										currentEditorState
									);

									if (
										newEditorState &&
										newEditorState !== currentEditorState
									) {
										setEditorState(newEditorState);
									}
								},
								moveBlockDown: () => {
									const currentEditorState = getEditorState();
									const newEditorState = MoveBlock.down(
										contentBlock,
										currentEditorState
									);

									if (
										newEditorState &&
										newEditorState !== currentEditorState
									) {
										setEditorState(newEditorState);
									}
								},

								setBlockDataImmediately: (
									data,
									doNotKeepFocus,
									useEntity,
									callback
								) => {
									const currentEditorState = getEditorState();
									const selection = currentEditorState.getSelection();

									let newEditorState = setBlockData(
										contentBlock,
										data,
										useEntity,
										currentEditorState
									);

									if (doNotKeepFocus) {
										newEditorState = EditorState.forceSelection(
											newEditorState,
											selection
										);
									}

									setEditorState(newEditorState);
								},

								setBlockData: (
									data,
									doNotKeepFocus,
									useEntity,
									callback
								) => {
									const first = !pendingUpdates;

									pendingUpdates = pendingUpdates ?? [];

									pendingUpdates.push({
										data,
										doNotKeepFocus,
										useEntity,
										callback,
									});

									if (first) {
										setTimeout(() => {
											const currentEditorState = getEditorState();
											const selection = currentEditorState.getSelection();

											let newEditorState = currentEditorState;

											for (let update of pendingUpdates) {
												newEditorState = setBlockData(
													contentBlock,
													update.data,
													update.useEntity,
													newEditorState
												);

												if (!update.doNotKeepFocus) {
													newEditorState = EditorState.forceSelection(
														newEditorState,
														selection
													);
												}
											}

											setEditorState(newEditorState);

											pendingUpdates.forEach(p =>
												p.callback?.()
											);

											pendingUpdates = null;
										}, 100);
									}
								},
								removeBlock: () => {
									const newState = removeBlock(
										contentBlock,
										getEditorState()
									);

									setEditorState(newState);
								},
							},
						};
					}
				}
			},

			blockStyleFn: (contentBlock, { getEditorState }) => {
				const editorState = getEditorState();

				for (let style of customStyles) {
					if (style.handlesBlock(contentBlock, editorState)) {
						return style.className;
					}
				}
			},

			getContext(getEditorState, setEditorState) {
				return {
					get customBlockTypes() {
						return new Set(
							customBlocks.map(c => c.type).filter(Boolean)
						);
					},
				};
			},
		};
	},
};
