export default function openTag (tag, attributes = {}) {
	const attr = Object.keys(attributes).map((name) => `${name}="${attributes[name]}"`).join(' ');

	return attr ? `<${tag} ${attr}>` : `<${tag}>`;
}
