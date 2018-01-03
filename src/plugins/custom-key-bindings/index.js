import {Events} from 'nti-commons';
import Logger from 'nti-util-logger';
import {getDefaultKeyBinding} from 'draft-js';

import {HANDLED, NOT_HANDLED} from '../Constants';

const {getKeyCode} = Events;
const logger = Logger.get('web:editor:core');

export default {
	create: (config = {}) => {
		const getCustomKeyBindings = (cmp) => {
			return (cmp && cmp.getProps().customKeyBindings) || config;
		};

		return {
			handleKeyCommand: (command, editorState, editorCmp) => {
				const {commandOverride: {[command]: override} = {}} = this;

				delete this.commandOverride;

				const customKeyBindings = getCustomKeyBindings(editorCmp);

				const fn = customKeyBindings[override] || customKeyBindings[command];
				if (fn) {
					if (typeof fn !== 'function') {
						logger.warn('Binding for %s is not a function!', command, override);
					} else if(fn(editorState)) {
						return HANDLED;
					}
				}

				return NOT_HANDLED;
			},

			keyBindingFn: (e, editorState, editorCmp) => {
				const keyCode = getKeyCode(e);
				const defaults = getDefaultKeyBinding(e);
				const customKeyBindings = getCustomKeyBindings(editorCmp);

				if (customKeyBindings[keyCode]) {
					this.commandOverride = {[defaults]: keyCode};
				}

				return defaults;
			}
		};
	}
};
