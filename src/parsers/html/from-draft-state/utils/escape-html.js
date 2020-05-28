export default function escapeHTML (text) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(text));
	return div.innerHTML;
}
