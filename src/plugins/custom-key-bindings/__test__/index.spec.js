/* eslint-env jest */
import customKeyBindingsPlugin from '../index';
import {HANDLED, NOT_HANDLED} from '../../Constants';

describe('customKeyBindings', () => {
	const keyBindingsPlugin = customKeyBindingsPlugin.create();

	const editorState = {};

	const customKeyBindings = {
		'nti-Enter': function () {
			return true;
		}
	};

	const cmp = {
		getProps: function () {
			return {
				customKeyBindings
			};
		}
	};

	test('Test handled', () => {
		const event = {
			key: 'Enter'
		};

		keyBindingsPlugin.keyBindingFn(event, editorState, cmp);

		const result = keyBindingsPlugin.handleKeyCommand('nti-Enter', editorState, cmp);

		expect(result).toEqual(HANDLED);
	});

	test('Test not handled', () => {
		const event = {
			key: 'Backspace'
		};

		keyBindingsPlugin.keyBindingFn(event, editorState, cmp);

		const result = keyBindingsPlugin.handleKeyCommand('nti-Backspace', editorState, cmp);

		expect(result).toEqual(NOT_HANDLED);
	});

	test('Test bindings as config', () => {
		const keyBindingsPluginWithConfig = customKeyBindingsPlugin.create(customKeyBindings);

		const cmpNoBindings = {
			getProps: function () {
				return {};
			}
		};

		const event = {
			key: 'Enter'
		};

		keyBindingsPluginWithConfig.keyBindingFn(event, editorState, cmpNoBindings);

		const result = keyBindingsPluginWithConfig.handleKeyCommand('nti-Enter', editorState, cmpNoBindings);

		expect(result).toEqual(HANDLED);
	});
});
