import {EVENT_HANDLED, EVENT_NOT_HANDLED} from '../Constants';

import {getStateForInput} from './utils';

//There is a pull request that we could use once it gets merged in, but I'm not sure
//when/if that will happen. https://github.com/facebook/draft-js/pull/510
export default {
	create: () => {
		return {
			handleBeforeInput (chars, editorState, {setEditorState}) {
				const newState = getStateForInput(chars, editorState);

				if (newState) {
					setEditorState(newState);
					return EVENT_HANDLED;
				}

				return EVENT_NOT_HANDLED;
			}
		};
	}
};
