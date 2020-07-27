import {EditorState} from 'draft-js';

import {setBlockData, removeBlock, indexOfType} from './utils';

export default {
	create: (config = {}) => {
		const {customRenderers = [], customStyles = [], blockProps} = config;

		let extraProps = blockProps || {};

		return {
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
			}
		};
	}
};
