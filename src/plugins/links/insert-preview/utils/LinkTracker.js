import {EditorState} from 'draft-js';

import {CHANGE_TYPES} from '../../../../Constants';
import {isLinkEntity} from '../../link-utils';

import findLinks from './find-links';
import * as Preview from './Preview';

export default class LinkTracker {
	#linkToPreview = null;
	#getDataForLink = null;
	#previousContent = null;

	constructor ({getDataForLink}) {
		this.#getDataForLink = getDataForLink || ((d) => d);
		this.#linkToPreview = new Map();
	}

	fixEditorState (editorState) {
		const firstPass = !this.previousContent; 
		const content = editorState.getCurrentContent();
		
		if (this.#previousContent === content) { return editorState; }

		this.#previousContent = content;

		const links = findLinks(content);

		if (!links.length) { return editorState; }

		const newContent = links.reduce((acc, link) => {
			return this.hasPreview(link) ?
				this.updatePreview(link, acc) :
				this.insertPreview(link, acc);
		}, content);

		const prevSelection = editorState.getSelection();
		
		return EditorState.forceSelection(
			EditorState.push(editorState, newContent, CHANGE_TYPES.INSERT_FRAGMENT),
			prevSelection
		);
	}

	hasPreview (link) {
		return link?.entity?.getData()?.['has-preview'] === 'preview';
	}

	insertPreview (link, content) {
		const {preview, content:previewContent} = Preview.insert(link, this.#getDataForLink, content);

		this.#linkToPreview.set(link.entityKey, preview);

		return previewContent;
	}

	updatePreview (link, content) {
		const existingPreview = this.#linkToPreview.get(link.entityKey);

		if (!existingPreview) { return; }

		const {preview, content: previewContent} = Preview.update(
			existingPreview,
			link,
			this.#getDataForLink,
			content
		);

		this.#linkToPreview.set(link.entityKey, preview);

		return previewContent;
	}
}