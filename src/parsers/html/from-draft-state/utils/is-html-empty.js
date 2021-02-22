const WHITESPACE_ENTITIES_AND_TAGS = /((<[^>]+>)|&nbsp;|[\s\r\n])+/gi;

export default function isHTMLEmpty(html) {
	if (!Array.isArray(html)) {
		html = [html];
	}

	// This filter fn will return true if:
	// 1) x is not 'null' AND:
	// 2a) x is not a string OR
	// 2b) x is a string the does not reduce to length 0
	let empties = x =>
		x &&
		(typeof x !== 'string' ||
			x.replace(WHITESPACE_ENTITIES_AND_TAGS, '').length);

	return html.filter(empties).length === 0;
}
