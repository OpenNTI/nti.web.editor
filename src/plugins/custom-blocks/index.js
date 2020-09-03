import {EditorState} from 'draft-js';

import {HANDLED, NOT_HANDLED} from '../Constants';

import {setBlockData, removeBlock, MoveBlock, indexOfType} from './utils';
import CustomBlock from './components/CustomBlock';
import * as DragStore from './DragStore';

export default {
	CustomBlock,
	create: (config = {}) => {
		const {customBlocks = [], customRenderers = [], customStyles = [], blockProps} = config;

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
			initialize ({setEditorState, getEditorState, getEditorRef}) {
				unsubscribe = DragStore.subscribeToRemoveFromOtherEditors(() => {
					//TODO: remove the block if it was in this editor and is no longer
				});
			},

			willUnmount () {
				unsubscribe?.();
			},

			handleDrop (selection, dataTransfer, type, {getEditorState, setEditorState, getEditorRef}) {
				const dragData = DragStore.getDataForDrop(dataTransfer);

				const newEditorState = dragData && MoveBlock.toSelection(
					dragData,
					selection,
					getEditorState(),
					() => DragStore.removeFromOtherEditors(dragData, getEditorRef())
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
				extraProps = {...extraProps, ...props};
			},


			getNestedState (block) {
				for (let renderer of customRenderers) {
					if (renderer.getNestedState) {
						return renderer.getNestedState(block);
					}
				}
			},


			blockRendererFn: (contentBlock, pluginProps) => {
				const {getEditorState, setEditorState} = pluginProps;
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
								indexOfType: indexOfType(contentBlock, renderer.handlesBlock, editorState),
								setBlockData: (data, doNotKeepFocus, useEntity, callback) => {
									const first = !pendingUpdates;

									pendingUpdates = pendingUpdates ?? [];

									pendingUpdates.push({data, doNotKeepFocus, useEntity, callback});

									if (first) {
										setTimeout(() => {
											const currentEditorState = getEditorState();
											const selection = currentEditorState.getSelection();

											let newEditorState = currentEditorState;

											for (let update of pendingUpdates) {
												newEditorState = setBlockData(contentBlock, update.data, update.useEntity, newEditorState);

												if (!update.doNotKeepFocus) {
													newEditorState = EditorState.forceSelection(newEditorState, selection);
												}
											}

											setEditorState(newEditorState);

											pendingUpdates.forEach(p => p.callback?.());

											pendingUpdates = null;
										}, 100);
									}
								},
								removeBlock: () => {
									const newState = removeBlock(contentBlock, getEditorState());

									setEditorState(newState);
								}
							}
						};
					}
				}
			},

			blockStyleFn: (contentBlock, {getEditorState}) => {
				const editorState = getEditorState();

				for (let style of customStyles) {
					if (style.handlesBlock(contentBlock, editorState)) {
						return style.className;
					}
				}
			},

			getContext (getEditorState, setEditorState) {
				return {
					get customBlockTypes () {
						return new Set(customBlocks.map(c => c.type).filter(Boolean));
					}
				};
			}
		};
	}
};
