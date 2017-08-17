import PropTypes from 'prop-types';
import React from 'react';
import {Editor, EditorState, Entity, convertFromRaw, convertToRaw, CompositeDecorator} from 'draft-js';
import {mount} from 'enzyme';

const LINK_CLS = 'link-component';

function findLinkEntities (contentBlock, callback) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();

			return (
				entityKey !== null &&
				Entity.get(entityKey).getType() === 'LINK'
			);
		},
		callback
	);
}

Link.propTypes = {
	offsetKey: PropTypes.string,
	children: PropTypes.any
};
function Link ({offsetKey, children}) {
	return (
		<div className={LINK_CLS} data-offset-key={offsetKey}>
			{children}
		</div>
	);
}


const decorator = new CompositeDecorator([
	{
		strategy: findLinkEntities,
		component: Link
	}
]);


export function getEditorState (raw) {
	return raw ? EditorState.createWithContent(convertFromRaw(raw), decorator) : EditorState.createEmpty(decorator);
}

export function getRawFromState (editorState) {
	return convertToRaw(editorState.getCurrentContent());
}


export function getStateAndOffsetKeys (raw) {
	const state = getEditorState(raw);
	const wrapper = mount((<Editor editorState={state} />));
	const link = wrapper.find(`.${LINK_CLS}`);
	const offsetKeys = link.map(x => x.prop('data-offset-key'));
	const blockKeys = state.getCurrentContent().getBlocksAsArray().map(x => x.key);
	const entityKeys = Object.keys(convertToRaw(state.getCurrentContent()).entityMap);

	return {state, offsetKeys, blockKeys, entityKeys};
}

export function getOffsetKeys (state) {
	const wrapper = mount(<Editor editorState={state} />);
	const links = wrapper.find(`.${LINK_CLS}`);

	return links.map(x => x.prop('data-offset-key'));
}
