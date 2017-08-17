const createSafeDocument = (html) => {
	const doc = document.implementation.createHTMLDocument();
	doc.getElementsByTagName('body')[0].innerHTML = html;

	return doc;
};

const replaceElement = (doc, oldEl, newTag) => {
	const newEl = doc.createElement(newTag);
	newEl.innerHTML = oldEl && oldEl.innerHTML;
	oldEl && oldEl.parentElement.replaceChild(newEl, oldEl);
};

export default (html) => {
	if (!(document.implementation && document.implementation.createHTMLDocument && html)) { return html; }

	const doc = createSafeDocument(html);

	const h2Map = Array.from(doc.querySelectorAll('.chapter.title')).map(el => ({
		el: el,
		newType: 'h2'
	}));

	const quoteMap = Array.from(doc.querySelectorAll('[ntiid].sidebar')).map(el => ({
		el: el,
		newType: 'blockquote'
	}));

	const h3Map = Array.from(doc.querySelectorAll('[ntiid].subsection.title')).map(el => ({
		el: el,
		newType: 'h3'
	}));

	const allElements = [...h2Map, ...quoteMap, ...h3Map];
	for (let i = 0; i < allElements.length; i++) {
		replaceElement(doc, allElements[i].el, allElements[i].newType);
	}

	return doc.getElementsByTagName('body')[0].innerHTML;
};
