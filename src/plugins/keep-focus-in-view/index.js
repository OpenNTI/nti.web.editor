import {getVisibleSelectionRect} from 'draft-js';
import {getViewportHeight, getViewportWidth} from 'nti-lib-dom';

//TODO: move this out into utility files
function getScrollPosition (parent) {
	if (parent === global) {
		return {
			top: parent.pageYOffset,
			left: parent.pageXOffset
		};
	}

	return {
		top: parent.scrollTop,
		let: parent.scrollLeft
	};
}


function scrollParentTo (parent, left, top) {
	if (parent === global) {
		parent.scrollTo(left, top);
	} else {
		parent.scrollTop = top;
		parent.scrollLeft = left;
	}
}


function getParentRect (parent) {
	if (parent === global) {
		const viewWidth = getViewportWidth();
		const viewHeight = getViewportHeight();

		return {
			top: 0,
			left: 0,
			right: viewWidth,
			bottom: viewHeight,
			width: viewWidth,
			height: viewHeight
		};
	}

	return parent.getBoundingClientRect();
}


function ensureRectIsVisible (rect, parent, {padding}) {
	const parentRect = getParentRect(parent);
	const {top:currentScrollTop, left:currentScrollLeft} = getScrollPosition(parent);
	let scrollTop;

	if (rect.height > parentRect.height) {
		scrollTop = rect.top - padding;
	} else if (rect.top - parentRect.top < padding) {
		scrollTop = currentScrollTop - ((parentRect.top + padding) - rect.top);
	} else if (rect.bottom > parentRect.bottom - padding) {
		scrollTop = currentScrollTop + (rect.bottom - (parentRect.bottom - padding));
	} else {
		scrollTop = currentScrollTop;
	}

	scrollTop = Math.max(scrollTop, 0);

	if (scrollTop !== currentScrollTop) {
		scrollParentTo(parent, currentScrollLeft, scrollTop);
	}
}


export default {
	create: (config = {padding: 80}) => {
		const getScrollParent = config.getScrollParent || (() => global);

		let lastSelection;


		function isPotentialScroll (editorState) {
			const selection = editorState.getSelection();

			if (lastSelection && selection.equals(lastSelection)) {
				return false;
			}

			lastSelection = selection;
			return true;
		}

		return {
			onChange (editorState) {
				if (!isPotentialScroll(editorState)) {
					return editorState;
				}

				const selectionRect = getVisibleSelectionRect(global);

				if (selectionRect) {
					ensureRectIsVisible(selectionRect, getScrollParent(), config);
				}

				return editorState;
			}
		};
	}
};
