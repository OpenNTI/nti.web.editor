export default function closeTag(tag) {
	tag = tag.tag ?? tag;

	return `</${tag}>`;
}
