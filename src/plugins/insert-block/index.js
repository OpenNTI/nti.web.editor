import {HANDLED, NOT_HANDLED} from '../Constants';

import Button from './components/Button';
import BlockCount from './components/BlockCount';
import {DRAG_DATA_TYPE} from './Constants';
import {
	insertAtomicBlock,
	insertBlock,
	getSelectedText,
	ensureMaintainSelection,
	moveSelectionToNextBlock,
	getBlockCount
} from './utils';

//https://github.com/facebook/draft-js/issues/442

export default {
	components: {Button, BlockCount},

	create: (/*config = {}*/) => {
		const insertionHandlers = {};

		return {
			handleDrop (selection, dataTransfer) {
				const insertionId = dataTransfer.data.getData(DRAG_DATA_TYPE);
				const handler = insertionHandlers[insertionId];


				if (handler) {
					handler(selection);
					return HANDLED;
				}

				return NOT_HANDLED;
			},


			getContext (getEditorState, setEditorState, focus, plugins = []) {
				let getNestedStateFns = [];

				for (let plugin of plugins) {
					if (plugin.getNestedState) {
						getNestedStateFns.push(plugin.getNestedState);
					}
				}

				function getNestedState (block) {
					for (let fn of getNestedStateFns) {
						const blocks = fn(block);

						if (blocks) {
							return blocks;
						}
					}
				}

				return {
					get allowInsertBlock () {
						//TODO: add a config for disabling inserting blocks given certain selections
						return true;
					},

					getInsertBlockCount: (predicate, group) => {
						return getBlockCount(getEditorState(), predicate, group, getNestedState);
					},


					getInsertMethod: (selection) => {
						return (block, replaceRange, maintainSelection) => {
							const newState = insertBlock(block, replaceRange, selection, getEditorState());

							setEditorState(maintainSelection
								? ensureMaintainSelection(newState)
								: moveSelectionToNextBlock(newState), focus);
						};
					},

					insertAtomicBlock (data, selection) {
						const newState = insertAtomicBlock(data, selection, getEditorState());

						setEditorState(newState);
					},

					getSelectedTextForInsertion: () => {
						return getSelectedText(getEditorState());
					},


					registerInsertHandler (id, handler) {
						insertionHandlers[id] = handler;
					},


					unregisterInsertHandler (id) {
						delete insertionHandlers[id];
					}
				};
			}
		};
	}
};
