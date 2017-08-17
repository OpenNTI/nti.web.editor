import EventEmitter from 'events';

const STATE = Symbol('State');

export const getEventFor = (key) => `${key}-changed`;

export default class PluginStore extends EventEmitter {
	constructor (initialState = {}) {
		super();
		this.setMaxListeners(1000);

		this[STATE] = initialState;
	}

	/**
	 * Attach multiple listeners
	 * @param {Object} events a map of key to handler
	 * @return {void}
	 */
	addListeners (events) {
		for (let event of Object.keys(events)) {
			this.removeListener(event, events[event]);
			this.addListener(event, events[event]);
		}
	}


	/**
	 * Remove multiple listenrs
	 * @param  {Object} events a map of key to handler
	 * @return {void}
	 */
	removeListeners (events) {
		for (let event of Object.keys(events)) {
			this.removeListener(event, events[event]);
		}
	}


	get state () {
		return this[STATE];
	}


	getItem (key) {
		return this[STATE][key];
	}


	setItem (key, value) {
		const oldValue = this.getItem(key);

		this[STATE][key] = value;

		if (oldValue !== value) {
			this.emit(getEventFor(key), value);
		}

		return value;
	}


	clearItem (key) {
		const oldValue = this.getItem(key);

		delete this[STATE][key];

		if (oldValue) {
			this.emit(getEventFor(key), null);
		}
	}
}

export function createStore (initialState) {
	return new PluginStore(initialState);
}
