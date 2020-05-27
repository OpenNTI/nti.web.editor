import getTagName from './get-tag-name';

const NewLineRegex = /[\r|\n]/;
const ConsecutiveWhitespace = /\s+/;

const AllowedInline = new Set([
	'a',
	'b',
	'i',
	'u',
	'em',
	'code',
	's',
]);

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

const PreserveWhitespace = new Set(['pre']);
const PreserveNewLines = new Set(['pre']);

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
	'p': 50,
	'div': 0,
};


const blockSelector = Array.from(BlockElements).join(', ');

const getNodePrecedence = node => BlockPrecedence[getTagName(node)] ?? -1;

const isTextNode = node => getTagName(node) === '#text';
const isEmptyTextNode = node => isTextNode(node) && node.textContent.trim() === '';

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
	_blockStack = [];
	_inlineStack = [];

	popBlock () {
		return this._blockStack.pop();
	}

	pushBlock (node) {
		const current = this._blockStack[this._blockStack.length - 1];

		if (current) { current.closed = true; }

		this._blockStack.push({node, closed: false});
		this.appendChild(node);
		return node;
	}

	get currentBlock () {
		const current = this._blockStack[this._blockStack.length - 1];

		if (!current) { return null; }
		if (!current.closed) { return current.node; }

		this.popBlock();
		return this.pushBlock(this.cloneNode(current.node)).node;
	}

	popInline () {
		this._inlineStack.pop();
	}

	pushInline (node) {
		const currentInline = this.currentInline;
		const currentBlock = this.currentBlock;

		if (!currentBlock) {
			throw new Error('Cannot push inline without a block on the stack.');
		}

		this._inlineStack.push(node);

		if (currentInline) { currentInline.appendChild(node); }
		else { currentBlock.appendChild(node); }
	}

	get currentInline () {
		return this._inlineStack[this._inlineStack.length - 1];
	}

	splitCurrentBlock () {
		const currentInline = this._inlineStack;
		const {currentBlock} = this;

		const clone = this.cloneNode(currentBlock, false);

		this.popBlock();
		this.pushBlock(clone);

		this._inlineStack = [];

		for (let inline of currentInline) {
			this.pushInline(this.cloneNode(inline, false));
		}
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
		this._stack = [];
		this._cleanBody = getSafeBody('');

		this.cleanBlock(getSafeBody(html));

		return this._cleanBody;
	}

	cleanTextNode (node) {
		const text = node.textContent;

		const preserveNewLines = PreserveNewLines.has(getTagName(this.currentBlock));
		const preserveWhitespace = PreserveWhitespace.has(getTagName(this.currentBlock));

		const lines = preserveNewLines ? text.split(NewLineRegex) : [text.replace(new RegExp(NewLineRegex, 'g'), '')];

		for (let i = 0; i < lines.length; i++) {
			if (i > 0) { this.splitCurrentBlock(); }

			const {currentBlock, currentInline} = this;
			const current = currentInline || currentBlock;

			if (preserveWhitespace) {
				current.appendChild(this.cleanDocument.createTextNode(lines[i]));
			} else {
				const collapsed = lines[i].replace(ConsecutiveWhitespace, ' ');
				const startsWithWhitespace = collapsed.startsWith(' ');

				const existingText = currentBlock.textContent || '';
				const existingEndsWithWhitespace = existingText.endsWith(' ');

				let fixedText = '';

				if (startsWithWhitespace && !existingText) {
					fixedText = collapsed.trimStart();
				} else if (startsWithWhitespace && existingEndsWithWhitespace) {
					fixedText = collapsed.trimStart();
				} else {
					fixedText = collapsed;
				}

				current.appendChild(
					this.cleanDocument.createTextNode(fixedText)
				);
			}
		}
	}

	cleanInline (node) {
		let current = this.currentBlock;
		const implicit = !current;

		if (implicit && isEmptyTextNode(node)) { return; }

		if (implicit) {
			current = this.push(this.createImplicit());
		}

		if (isTextNode(node)) { this.cleanTextNode(node); }

		const keep = AllowedInline.has(getTagName(node));

		if (keep) {
			this.pushInline(this.cloneNode(node, false));
		}

		const children = Array.from(node.childNodes);

		for (let child of children) {
			this.cleanInline(child);
		}

		if (keep) {
			this.popInline();
		}

		if (implicit) {
			this.popBlock();
		}
	}

	cleanBlock (node) {
		if (!node) { return; }

		const current = this.currentBlock;
		const keep = (!current || getNodePrecedence(node) >= getNodePrecedence(current)) && !isBody(node);

		if (keep) {
			this.pushBlock(this.cloneNode(node));
		}

		const children = Array.from(node.childNodes);

		for (let child of children) {

			if (isList(child)) { this.cleanList(child); }
			else if (isBlock(child)) { this.cleanBlock(child); }
			else { this.cleanInline(child); } 
		}

		if (keep) {
			this.popBlock();
		}
	}

	cleanList (node) {

	}
}	


export default function getNodesFromHTML (html) {
	const cleaner = new InputCleaner();

	return Array.from(cleaner.cleanHTML(html).querySelectorAll(blockSelector));
}