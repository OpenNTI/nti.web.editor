import {
	RichUtils
} from 'draft-js';

import {BLOCKS} from '../../Constants';
import {EVENT_HANDLED, EVENT_NOT_HANDLED} from '../Constants';

import handleBreak from './handleBreak';
import handleConvertIfEmpty from './handleConvertIfEmpty';

const DEFAULT_BREAK_TO = {
	[BLOCKS.HEADER_ONE]: BLOCKS.UNSTYLED,
	[BLOCKS.HEADER_TWO]: BLOCKS.UNSTYLED,
	[BLOCKS.HEADER_THREE]: BLOCKS.UNSTYLED,
	[BLOCKS.HEADER_FOUR]: BLOCKS.UNSTYLED,
	[BLOCKS.HEADER_FIVE]: BLOCKS.UNSTYLED,
	[BLOCKS.HEADER_SIX]: BLOCKS.HEADER_SIX
};

const DEFAULT_CONVERT_IF_EMPTY = {
	[BLOCKS.ORDERED_LIST_ITEM]: BLOCKS.UNSTYLED,
	[BLOCKS.UNORDERED_LIST_ITEM]: BLOCKS.UNSTYLED
};

/**
 * Return a plugin to break out of block types to
 * be more consistent with user expectations of rich
 * text editors.
 *
 * @param  {Object} config define the behavior
 * @param {Object} config.breakTo a map of type to type to convert the new block to on enter
 * @param {Object} config.convertIfEmpty a map of types to convert the current type to if its empty on enter
 * @return {Object}        the config
 */
export default {
	create: (config = {breakTo: DEFAULT_BREAK_TO, convertIfEmpty: DEFAULT_CONVERT_IF_EMPTY}) => {
		const {breakTo, convertIfEmpty} = config;

		return {
			handleReturn (e, editorState, {setEditorState}) {
				const selection = editorState.getSelection();

				//If the selection isn't collapsed there's nothing to do
				if (!selection.isCollapsed()) { return EVENT_NOT_HANDLED; }

				const currentBlockType = RichUtils.getCurrentBlockType(editorState);
				let handled = EVENT_NOT_HANDLED;

				if (convertIfEmpty[currentBlockType]) {
					handled = handleConvertIfEmpty(convertIfEmpty[currentBlockType], editorState, setEditorState);
				}

				if (handled !== EVENT_HANDLED && breakTo[currentBlockType]) {
					handled = handleBreak(breakTo[currentBlockType], editorState, setEditorState);
				}

				return handled;
			}
		};
	}
};
