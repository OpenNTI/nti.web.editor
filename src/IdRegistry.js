import EventEmitter from 'events';

import Logger from 'nti-util-logger';

const MAP = Symbol('Map');

const log = Logger.get('web:content:editor:draft-core:IdMap');

export default class IdRegistry extends EventEmitter {
	constructor () {
		super();
		this[MAP] = {};
	}


	getRegisterEvent (id) {
		return `${id}-registered`;
	}


	getUnregisterEvent (id) {
		return `${id}-unregistered`;
	}


	get (id) {
		return this[MAP][id];
	}


	register (id, editor) {
		if (this[MAP][id] && this[MAP][id] !== editor) {
			log.warn('Multiple Editors with the same ID: ', id);
		}

		this[MAP][id] = editor;

		this.emit('editor-registered', id, editor);
		this.emit(this.getRegisterEvent(id), editor);
	}


	unregister (id, editor) {
		if (this[MAP][id] && this[MAP][id] !== editor) {
			log.warn('Unregistering a different editor than was registered. ID: ', id);
		}

		delete this[MAP][id];

		this.emit('editor-unregistered', id);
		this.emit(this.getUnregisterEvent(id), editor);
	}
}
