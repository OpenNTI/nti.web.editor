export default function createDecoratorStrategy (tagStrat) {
	return (contentBlock, callback, contentState) => {
		contentBlock.findEntityRanges(
			(character) => {
				const entityKey = character.getEntity();

				if (entityKey) {
					debugger;
				}

				return entityKey !== null && contentState?.getEntity(entityKey)?.getType() === tagStrat.type;
			},
			callback
		);
	};
}