export default function createDecoratorStrategy (tagStrat) {
	return (contentBlock, callback, contentState) => {
		contentBlock.findEntityRanges(
			(character) => {
				const entityKey = character.getEntity();

				return entityKey !== null && contentState?.getEntity(entityKey)?.getType() === tagStrat.type;
			},
			callback
		);
	};
}