const Handled = 'handled';
const NotHandled =  'not-handled';

function objectSetBuilder (strategies) {
	const knownEntities = new Set();
	const map = {};

	const strats = Object.entries(strategies)
		.map(([key, strat]) => {
			return (entity) => {
				if (strat.coversEntity(entity)) {
					map[key] = map[key] || [];
					map[key].push(entity);
					return Handled;
				}

				return NotHandled;
			};
		});

	return {
		addEntity: (entity) => {
			if (knownEntities.has(entity.key)) { return; }

			knownEntities.add(entity.key);

			for (let strat of strats) {
				if (strat(entity) === Handled) { break; }
			}
		},

		getEntities: () => map
	};
}

function arraySetBuilder (strategies) {
	if (!Array.isArray(strategies)) {
		strategies = [strategies];
	}

	const knownEntities = new Set();
	const entities = [];

	return {
		addEntity: (entity) => {
			if (knownEntities.has(entity.key)) { return; }

			knownEntities.add(entity.key);

			for (let strat of strategies) {
				if (strat.coversEntity(entity)) {
					entities.push(entity);
				}
			}
		},

		getEntities: () => entities
	};
}

export default function getAllTags (strategies, editorState) {
	const builder = typeof strategies === 'object' ? objectSetBuilder(strategies) : arraySetBuilder(strategies);

	const content = editorState.getCurrentContent();
	let entities = [];

	content
		.getBlocksAsArray()
		.forEach((block) => {
			const text = block.getText();
			const characters = block.getCharacterList().toJS();

			for (let i = 0; i < characters.length; i++) {
				const char = characters[i];
				const current = entities[entities.length - 1];
				const entityKey = char.entity;

				if (entityKey && entityKey === current?.key) {
					current.text += text.charAt(i);
				} else if (entityKey) {
					const entity = content.getEntity(entityKey);

					entities.push({
						key: entityKey,
						type: entity.type,
						mutability: entity.mutability,
						data: entity.data,
						text: text.charAt(i)
					});
				}
			}
		});

	for (let entity of entities) {
		builder.addEntity(entity);
	}

	return builder.getEntities();
}