import { url } from '@nti/lib-commons';

export default function getFullHref(href, defaultProtocol = 'http:') {
	if (!href) {
		return '';
	}

	try {
		const parts = url.parse(href);

		if (!parts.protocol) {
			parts.host = href;
			parts.pathname = '';
			parts.protocol = defaultProtocol;

			return parts.toString().replace(/\/$/, '');
		}
	} catch {
		// invalid
		return '';
	}

	return href;
}
