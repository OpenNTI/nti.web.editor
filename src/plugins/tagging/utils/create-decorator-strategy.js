export default function createDecoratorStrategy(tagStrat) {
	return (contentBlock, callback, contentState) => {
		contentBlock.findEntityRanges(character => {
			const entityKey = character.getEntity();
			const entity = entityKey && contentState?.getEntity(entityKey);

			return entity !== null && tagStrat.coversEntity(entity);
		}, callback);
	};
}
