import punycode from 'punycode';

export default function decodeUnicode(str) {
	return punycode.ucs2.decode(str);
}
