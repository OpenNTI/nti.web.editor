export default function isFocusablePlaceholderBlock(block) {
	const { data } = block;

	return (
		data &&
		((data.get && data.get('focusablePlaceholder')) ||
			data['focusablePlaceholder'])
	);
}
