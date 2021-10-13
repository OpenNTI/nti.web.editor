
import { ENTITIES } from '../../../Constants';

import Link from './components/Link';

const Name = Symbol('Link Decorate');
const Wrappers = Symbol('Wrappers');

function strategy(contentBlock, callback, contentState) {
	contentBlock.findEntityRanges(character => {
		const entityKey = character.getEntity();

		return (
			entityKey !== null &&
			contentState.getEntity(entityKey).getType() === ENTITIES.LINK
		);
	}, callback);
}

export const create = (config = {}) => {
	let wrappers = config.LinkWrapper ? [config.LinkWrapper] : [];

	return {
		name: Name,
		get [Wrappers]() {
			return wrappers;
		},

		combine(otherPlugin) {
			if (otherPlugin.name !== Name) {
				throw new Error('Cannot combine a different plugin type');
			}

			wrappers = [...wrappers, ...otherPlugin[Wrappers]];
		},

		decorators: [
			{
				strategy,
				component: function LinkWrapper(props) {
					let link = <Link {...props} />;

					for (let Wrapper of wrappers) {
						link = <Wrapper {...props}>{link}</Wrapper>;
					}

					return link;
				},
			},
		],
	};
};
