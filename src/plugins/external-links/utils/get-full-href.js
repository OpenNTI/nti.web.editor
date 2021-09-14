import { url } from '@nti/lib-commons';

export default function getFullHref(href, defaultProtocol = 'http:') {
	if (!href) {
		return '';
	}

	const parts = url.parse(href);

	if (!parts.protocol || parts.protocol === 'file:') {
		parts.host = href;
		parts.pathname = '';
		parts.protocol = defaultProtocol;

		return parts.toString().replace(/\/$/, '');
	}

	return href;
}
