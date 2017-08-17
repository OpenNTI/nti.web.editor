import {EVENT_HANDLED} from '../Constants';

export default {
	create: () => {
		return {
			handleDrop () {
				return EVENT_HANDLED;
			}
		};
	}
};
