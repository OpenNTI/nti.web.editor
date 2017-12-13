import {HANDLED, NOT_HANDLED} from '../Constants';

import Button from './components/Button';
import BlockCount from './components/BlockCount';
import {DRAG_DATA_TYPE} from './Constants';
import {
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


			getContext (getEditorState, setEditorState, focus) {
				return {
					get allowInsertBlock () {
						//TODO: add a config for disabling inserting blocks given certain selections
						return true;
					},

					getInsertBlockCount: (predicate, group) => {
						return getBlockCount(getEditorState(), predicate, group);
					},


					getInsertMethod: (selection) => {
						return (block, replaceRange, maintainSelection) => {
							const newState = insertBlock(block, replaceRange, selection, getEditorState());

							setEditorState(maintainSelection
								? ensureMaintainSelection(newState)
								: moveSelectionToNextBlock(newState), focus);
						};
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
