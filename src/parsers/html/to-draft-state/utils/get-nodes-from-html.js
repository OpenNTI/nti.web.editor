import getTagName from './get-tag-name';

const NewLineRegex = /[\r|\n]/;
const ConsecutiveWhitespace = /\s+/;

//Tags that we will allow into the content of block tags.
//All other non-block tags will add their content, but not
//the tags themselves.
const AllowedInline = new Set(['a', 'b', 'i', 'u', 'em', 'code', 's']);

//All the tags that we treat as block elements. Other tags
//get treated as inline.
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
	'ul',
]);

const PreserveWhitespace = new Set(['pre']);
const PreserveNewLines = new Set(['pre']);

//Used to determine when a block node should break out of
//its parent. Some block nodes carry more weight for its contents.
//Since draft-js blocks are not allowed to be nested, when we see
//nested block nodes we have to decide how to flatten them. The precedence
//is used to determine when a nested block should append its contents to its
//parent, or when it split the parent and add itself and its contents to
//the body.
//
//<h1><p>text</p></h1> should the treat the text has h1 not a p
//
//More Examples:
// 1.) <li><pre>code</pre></li> => <li>code</li> because li has a higher precedence than pre
// 2.) <h1>Heading <pre>code</pre> Text</h1> => <h1>Heading</h1><pre>code</pre><h1>Text</h1> because h1 and pre have the same precedence
const BlockPrecedence = {
	ol: 200,
	ul: 200,
	li: 200,
	pre: 100,
	h1: 100,
	h2: 100,
	h3: 100,
	h4: 100,
	h6: 100,
	blockquote: 100,
	p: 50,
	div: 0,
};

const blockSelector = 'blockquote, div, h1, h2, h3, h4, h5, h6, li, p, pre';

const getNodePrecedence = node => BlockPrecedence[getTagName(node)] ?? -1;

const isTextNode = node => getTagName(node) === '#text';
const isEmptyTextNode = node =>
	isTextNode(node) && node.textContent.trim() === '';

const isBody = node => getTagName(node) === 'body';
const isBlock = node => BlockElements.has(getTagName(node));
const isListItem = node => getTagName(node) === 'li';
const isList = node => {
	const tag = getTagName(node);

	return tag === 'ul' || tag === 'ol';
};

//Creates a safe html document that we can manipulate without affecting the
//current page document
function getSafeBody(html) {
	try {
		const doc = document?.implementation?.createHTMLDocument?.(
			'scratchpad'
		);
		doc.documentElement.innerHTML = html;

		return doc.getElementsByTagName('body')[0];
	} catch (e) {
		return null;
	}
}

/**
 * Utility class for normalizing html input
 */
class InputNormalizer {
	_cleanBody = null;

	_blockStack = []; //Keep track of block nodes we've opened
	_inlineStack = []; //Keep track of inline nodes we've opened

	_currentList = null;

	get latestBlock() {
		return this._blockStack[this._blockStack.length - 1];
	}

	popBlock() {
		return this._blockStack.pop();
	}

	/**
	 * Push a block node to the stack, and maybe append it to the
	 * clean document. If there is already a block on the stack
	 * mark it as closed.
	 *
	 * @param  {Object} node        block node to push
	 * @param  {boolean} doNotAppend do not auto add the node to the clean body
	 * @returns {Object}             the node in the clean document that as added
	 */
	pushBlock(node, doNotAppend) {
		const current = this.latestBlock;

		if (current) {
			current.closed = true;
		}

		this._blockStack.push({ node, closed: false, doNotAppend });

		if (!doNotAppend) {
			this.appendChild(node);
		}

		return node;
	}

	/**
	 * Return the current block on the stack. If the current block has been closed
	 * add a clone of it to the stack.
	 *
	 * @returns {Object} current block node
	 */
	get currentBlock() {
		const current = this.latestBlock;

		if (!current) {
			return null;
		}
		if (!current.closed) {
			return current.node;
		}

		//if the block is closed, but it wasn't appended to the body.
		//we don't want to clone and append it here either...
		if (current.doNotAppend) {
			return null;
		}

		this.popBlock();
		return this.pushBlock(this.cloneNode(current.node)).node;
	}

	popInline() {
		this._inlineStack.pop();
	}

	/**
	 * Push an inline node to the stack. There must be a block node on the block
	 * stack. If there is already an inline node, add the new one to it. Otherwise
	 * add the new one to the current block.
	 *
	 * @param  {Object} node inline block to add
	 * @returns {[type]}      [description]
	 */
	pushInline(node) {
		const currentInline = this.currentInline;
		const currentBlock = this.currentBlock;

		if (!currentBlock) {
			throw new Error('Cannot push inline without a block on the stack.');
		}

		this._inlineStack.push(node);

		if (currentInline) {
			currentInline.appendChild(node);
		} else {
			currentBlock.appendChild(node);
		}
	}

	get currentInline() {
		return this._inlineStack[this._inlineStack.length - 1];
	}

	get currentList() {
		return this._currentList;
	}

	/**
	 * Set a list as the current one being normalized, and added it to the clean
	 * body.
	 *
	 * @param {node} list the list being normalized.
	 * @returns {void}
	 */
	setCurrentList(list) {
		this._currentList = list;

		if (list) {
			this.appendChild(list);
		}
	}

	/**
	 * Close the current block and inline tags, clone(shallow) them and append it
	 * to the body. For example:
	 *
	 * <pre>Test\nline</pre> => <pre>Test</pre><pre>line</pre>
	 *
	 * @returns {void}
	 */
	splitCurrentBlock() {
		const currentInline = this._inlineStack;
		const { currentBlock } = this;

		const clone = this.cloneNode(currentBlock, false);

		this.popBlock();
		this.pushBlock(clone);

		this._inlineStack = [];

		for (let inline of currentInline) {
			this.pushInline(this.cloneNode(inline, false));
		}
	}

	get cleanDocument() {
		return this._cleanBody.ownerDocument;
	}

	createElement(tag) {
		return this.cleanDocument.createElement(tag);
	}

	cloneNode(node, deep = false) {
		if (node.ownerDocument === this.cleanDocument) {
			return node.cloneNode(deep);
		}

		return this.cleanDocument.importNode(node, deep);
	}

	appendChild(node) {
		this._cleanBody.appendChild(node);
		return node;
	}

	removeChild(node) {
		this._cleanBody.removeChild(node);
		return node;
	}

	createImplicit() {
		const implicit = this.createElement('div');

		implicit.setAttribute('implicit', 'true');

		return implicit;
	}

	normalizeHTML(html) {
		this._stack = [];
		this._cleanBody = getSafeBody('');

		this.normalizeBlock(getSafeBody(html));

		return this._cleanBody;
	}

	/**
	 * Normalize a text node. Depending on the current block this will either:
	 *
	 * 1.) Collapse the text to one line, or split the current block for each line of text.
	 * 2.) Collapse consecutive whitespace (it tries to match how the html would be displayed), or keep the whitespace as is.
	 *
	 * @param  {Object} node textNode to add
	 * @returns {void}
	 */
	normalizeTextNode(node) {
		const text = node.textContent;

		const preserveNewLines = PreserveNewLines.has(
			getTagName(this.currentBlock)
		);
		const preserveWhitespace = PreserveWhitespace.has(
			getTagName(this.currentBlock)
		);

		const lines = preserveNewLines
			? text.split(NewLineRegex)
			: [text.replace(new RegExp(NewLineRegex, 'g'), '')];

		for (let i = 0; i < lines.length; i++) {
			if (i > 0) {
				this.splitCurrentBlock();
			}

			const { currentBlock, currentInline } = this;
			const current = currentInline || currentBlock;

			if (preserveWhitespace) {
				current.appendChild(
					this.cleanDocument.createTextNode(lines[i])
				);
			} else {
				//Collapse multiple white space characters to one space, then look
				//at the existing content to see if we need to trim the leading
				//whitespace or not
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

	/**
	 * Normalize an inline node. If there is not a current block, we create an implicit div.
	 * If the inline node is one of the allowed tags, we add the tag to the stack. Otherwise
	 * we just add its contents to the current block. All children will be treated like inline
	 * nodes, regardless of if they are in the Block set or not.
	 *
	 * @param  {Object} node inline node to add
	 * @returns {void}
	 */
	normalizeInline(node) {
		let current = this.currentBlock;
		const implicit = !current;
		const keep = AllowedInline.has(getTagName(node));

		//if there's no current block and the nodes is an empty text node
		//there's no need to add it.
		if (implicit && isEmptyTextNode(node)) {
			return;
		}

		if (implicit) {
			current = this.pushBlock(this.createImplicit());
		}

		if (keep) {
			this.pushInline(this.cloneNode(node, false));
		}

		if (isTextNode(node)) {
			this.normalizeTextNode(node);
		} else {
			for (let child of Array.from(node.childNodes)) {
				this.normalizeInline(child);
			}
		}

		if (keep) {
			this.popInline();
		}

		if (implicit) {
			this.popBlock();
		}
	}

	/**
	 * Normalize a block node. If the node is of higher or egual precedence to the current block node,
	 * add it to the stack and continue normalizing its contents. If the current block is higher precedence,
	 * the nodes contents will be normalized into the current block.
	 *
	 * @param  {Object} node block node to normalize
	 * @returns {void}
	 */
	normalizeBlock(node) {
		if (!node) {
			return;
		}

		const current = this.currentBlock;

		const keep =
			(!current ||
				getNodePrecedence(node) >= getNodePrecedence(current)) &&
			!isBody(node) &&
			!isList(node) &&
			!isListItem(node);

		if (keep) {
			this.pushBlock(this.cloneNode(node));
		}

		for (let child of Array.from(node.childNodes)) {
			if (isList(child)) {
				this.normalizeList(child);
			} else if (isListItem(child)) {
				this.normalizeListItem(child);
			} else if (isBlock(child)) {
				this.normalizeBlock(child);
			} else {
				this.normalizeInline(child);
			}

			if (keep) {
				const { node: cleanNode, closed } = this.latestBlock;

				//If the child closed this context, and we didn't get any
				//content we need to remove the cleaned node.
				//I.E:
				//<p>
				//  <p>Nested Paragraph</p>
				//</p>
				//
				//would go to
				//
				//<p>Nested Paragraph</p>
				//
				//not
				//
				//<p></p>
				//<p>Nested Paragraph</p>
				if (closed && cleanNode.textContent === '') {
					this.removeChild(cleanNode);
				}
			}
		}

		if (keep) {
			this.popBlock();
		}
	}

	/**
	 * Normalize a list item node. The node will be pushed to the block stack, but added to the current list.
	 *
	 * @param  {Object} node list item to add
	 * @returns {void}
	 */
	normalizeListItem(node) {
		const { currentList } = this;

		const clone = this.cloneNode(node);

		currentList.appendChild(clone);
		this.pushBlock(clone, true);

		for (let child of Array.from(node.childNodes)) {
			if (isList(child)) {
				this.normalizeList(child);
			} else if (isBlock(child)) {
				this.normalizeBlock(child);
			} else {
				this.normalizeInline(child);
			}

			//If the list item got closed without adding any content
			//that means there was only blocks that don't go in the li
			//so this li needs to be removed
			const { node: cleanNode, closed } = this.latestBlock;

			if (closed && cleanNode.textContent === '') {
				cleanNode.parentNode?.removeChild(cleanNode);
			}
		}

		this.popBlock();
	}

	/**
	 * Normalize a list node. If there is a current list, this list will be
	 * appended to the body with a higher data-depth attribute. After parsing
	 * this list's children, the current list will be cloned and added as the
	 * current list.
	 *
	 * @param  {Object} node the list to normalize
	 * @returns {void}
	 */
	normalizeList(node) {
		const { currentList } = this;

		const currentDepth = currentList
			? parseInt(currentList.getAttribute('data-depth'), 10)
			: -1;
		const nextDepth = currentDepth + 1;

		const clone = this.cloneNode(node, false);
		clone.setAttribute('data-depth', nextDepth);

		this.setCurrentList(clone);
		this.pushBlock(clone);

		for (let child of Array.from(node.childNodes)) {
			if (isListItem(child)) {
				this.normalizeListItem(child);
			}
		}

		if (currentList) {
			this.setCurrentList(this.cloneNode(currentList, false));
		} else {
			this.setCurrentList(null);
		}

		this.popBlock();
	}
}

/**
 * Get a flat list of dom nodes that directly relate 1-1 to draft-js state.
 *
 * @param  {string} html content to flatten and get nodes from
 * @returns {[Object]}    the flat list of nodes
 */
export default function getNodesFromHTML(html) {
	const cleaner = new InputNormalizer();
	const clean = cleaner.normalizeHTML(html);

	return Array.from(clean.querySelectorAll(blockSelector));
}
