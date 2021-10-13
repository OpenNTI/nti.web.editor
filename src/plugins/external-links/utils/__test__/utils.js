import PropTypes from 'prop-types';
import {
	Editor,
	EditorState,
	Entity,
	convertFromRaw,
	convertToRaw,
	CompositeDecorator,
} from 'draft-js';
import { render } from '@testing-library/react';

const LINK_CLS = 'link-component';

function findLinkEntities(contentBlock, callback) {
	contentBlock.findEntityRanges(character => {
		const entityKey = character.getEntity();

		return entityKey !== null && Entity.get(entityKey).getType() === 'LINK';
	}, callback);
}

Link.propTypes = {
	offsetKey: PropTypes.string,
	children: PropTypes.any,
};
function Link({ offsetKey, children }) {
	return (
		<div className={LINK_CLS} data-offset-key={offsetKey}>
			{children}
		</div>
	);
}

const decorator = new CompositeDecorator([
	{
		strategy: findLinkEntities,
		component: Link,
	},
]);

export function getEditorState(raw) {
	return raw
		? EditorState.createWithContent(convertFromRaw(raw), decorator)
		: EditorState.createEmpty(decorator);
}

export function getRawFromState(editorState) {
	return convertToRaw(editorState.getCurrentContent());
}

export function getStateAndOffsetKeys(raw) {
	const state = getEditorState(raw);
	const result = render(<Editor editorState={state} />);
	const links = result.container.querySelectorAll(`.${LINK_CLS}`);
	const offsetKeys = Array.from(links).map(x =>
		x.getAttribute('data-offset-key')
	);
	const blockKeys = state
		.getCurrentContent()
		.getBlocksAsArray()
		.map(x => x.key);
	const entityKeys = Object.keys(
		convertToRaw(state.getCurrentContent()).entityMap
	);

	return { state, offsetKeys, blockKeys, entityKeys };
}

export function getOffsetKeys(state) {
	const result = render(<Editor editorState={state} />);
	const links = result.container.querySelectorAll(`.${LINK_CLS}`);

	return Array.from(links).map(x => x.getAttribute('data-offset-key'));
}
