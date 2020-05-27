import getTagName from './get-tag-name';

const BlockElements = new Set([
	'blockquote',
	'div',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'li',
	'ol',
	'p',
	'pre',
	'ul'
]);

const BlockPrecedence = {
	'pre': 100,
	'h1': 100,
	'h2': 100,
	'h3': 100,
	'h4': 100,
	'h6': 100,
	'li': 100,
	'ol': 100,
	'ul': 100,
	'blockquote': 100,
	'p': 100,
	'div': 0,
};

const blockSelector = Array.from(BlockElements).join(', ');

const getNodePrecedence = node => BlockPrecedence[getTagName(node)] ?? -1;

const isEmptyTextNode = node => {
	if (getTagName(node) !== '#text') { return false; }

	return node.textContent.trim() === '';
};

const isBody = node => getTagName(node) === 'body';
const isBlock = node => BlockElements.has(getTagName(node));
const isList = (node) => {
	const tag = getTagName(node);

	return tag === 'ul' || tag === 'ol';
};

function getSafeBody (html) {
	try {
		const doc = document?.implementation?.createHTMLDocument?.('scratchpad');
		doc.documentElement.innerHTML = html;

		return doc.getElementsByTagName('body')[0];
	} catch (e) {
		return null;
	}
}

class InputCleaner {
	_cleanBody = null;
	_stack = [];

	pop () {
		return this._stack.pop();
	}

	push (node) {
		const current = this._stack[this._stack.length - 1];

		if (current) { current.closed = true; }

		this._stack.push({node, closed: false});
		this.appendChild(node);
		return node;
	}

	get current () {
		const current = this._stack[this._stack.length - 1];

		if (!current) { return null; }
		if (!current.closed) { return current.node; }

		this.pop();
		return this.push(this.cloneNode(current.node)).node;
	}

	get cleanDocument () {
		return this._cleanBody.ownerDocument;
	}

	createElement (tag) {
		return this.cleanDocument.createElement(tag);
	}

	cloneNode (node, deep = false) {
		if (node.ownerDocument === this.cleanDocument) {
			return node.cloneNode(deep);
		}

		return this.cleanDocument.importNode(node, deep);
	}

	appendChild (node) {
		this._cleanBody.appendChild(node);
		return node;
	}

	createImplicit () {
		const implicit = this.createElement('div');

		implicit.setAttribute('implicit', 'true');

		return implicit;
	}


	cleanHTML (html) {
		console.log('Parsing HTML: ', html);
		this._stack = [];
		this._cleanBody = getSafeBody('');

		this.cleanBlock(getSafeBody(html));

		return this._cleanBody;
	}

	cleanInline (node) {
		let current = this.current;

		if (!current && isEmptyTextNode(node)) { return; }

		if (!current) {
			current = this.appendChild(this.createImplicit());
		}
		console.log('Adding Inline: ', node.textContent, this.cloneNode(node, true).textContent);
		current.appendChild(this.cloneNode(node, true));

		console.log('Added Inline: ', current.textContent);
	}

	cleanBlock (node) {
		if (!node) { return; }

		const current = this.current;
		const keep = (!current || getNodePrecedence(node) >= getNodePrecedence(current)) && !isBody(node);
		
		console.log('Parsing Node: ', getTagName(node), keep);

		if (keep) {
			this.push(this.cloneNode(node));
		}


		const children = Array.from(node.childNodes);

		console.log('Cleaning Children: ', children.map(x => getTagName(x)));

		for (let child of children) {

			if (isList(child)) { this.cleanList(child); }
			else if (isBlock(child)) { this.cleanBlock(child); }
			else { this.cleanInline(child); } 
		}

		if (keep) {
			this.pop();
		}
	}

	cleanList (node) {

	}

}	


export default function getNodesFromHTML (html) {
	const cleaner = new InputCleaner();

	return Array.from(cleaner.cleanHTML(html).querySelectorAll(blockSelector));
}