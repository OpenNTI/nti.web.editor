export default function openTag (tag, attributes = {}) {
	if (typeof tag === 'object') {
		attributes = {...attributes, ...(tag.attributes ?? {})};
		tag = tag.tag;
	}

	const attr = Object.keys(attributes).map((name) => `${name}="${attributes[name]}"`).join(' ');

	return attr ? `<${tag} ${attr}>` : `<${tag}>`;
}
