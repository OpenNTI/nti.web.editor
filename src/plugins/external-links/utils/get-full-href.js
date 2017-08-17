import Url from 'url';

const defaultProtocol = 'http:';

export default function getFullHref (href) {
	if (!href) { return ''; }

	let parts = Url.parse(href);

	if (!parts.protocol) {
		parts.protocol = defaultProtocol;
		parts.host = href;
		parts.pathname = '';
		parts.path = '';

		return Url.format(parts);
	}

	return href;
}
