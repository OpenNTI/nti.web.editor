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

				let pendingState;
				let pendingUpdate;


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
								setBlockData: (data, doNotKeepFocus) => {
									const newState = setBlockData(contentBlock, data, pendingState || getEditorState());

									pendingState = newState;

									if (!pendingUpdate) {
										pendingUpdate = setTimeout(() => {
											const current = getEditorState();

											if (doNotKeepFocus) {
												setEditorState(pendingState);
											} else {
												setEditorState(EditorState.forceSelection(pendingState, current.getSelection()));
											}

											pendingState = null;
											pendingUpdate = null;
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
