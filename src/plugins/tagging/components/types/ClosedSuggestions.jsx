import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Flyout } from '@nti/web-commons';

import { Suggestions } from '../../utils';

import Base from './Base';

ClosedSuggestionTag.handlesStrategy = strat =>
	strat.hasSuggestions && strat.suggestedOnly;
ClosedSuggestionTag.propTypes = {
	strategy: PropTypes.shape({
		SuggestionsCmp: PropTypes.any,
	}),
	entityKey: PropTypes.string,
	blockKey: PropTypes.string,
	offsetKey: PropTypes.string,
	subscribeToSelection: PropTypes.func,
	subscribeToFocused: PropTypes.func,
	getEditorState: PropTypes.func,
	setEditorState: PropTypes.func,
};
export default function ClosedSuggestionTag(props) {
	const {
		strategy,
		entityKey,
		blockKey,
		offsetKey,
		subscribeToSelection,
		subscribeToFocused,
		getEditorState,
		setEditorState,
	} = props;

	const [selection, setSelection] = useState(null);
	const [focused, setFocused] = useState(null);

	useEffect(() => {
		return subscribeToSelection(setSelection);
	}, []);

	useEffect(() => {
		return subscribeToFocused(setFocused);
	}, []);

	const editorState = getEditorState();
	const suggestionArgs = [
		strategy,
		entityKey,
		blockKey,
		offsetKey,
		editorState,
		selection,
	];

	const suggestion = Suggestions.getSuggestion(...suggestionArgs);

	if (suggestion) {
		return <Base {...props} suggestion={suggestion} />;
	}

	const { SuggestionsCmp } = strategy;

	const search = Suggestions.getSuggestionSearch(...suggestionArgs);
	const applySuggestion = (newSuggestion, displayText) =>
		setEditorState(
			Suggestions.setSuggestion(
				newSuggestion,
				displayText,
				search,
				...suggestionArgs
			)
		);

	return (
		<Flyout.Triggered
			trigger={
				<span>
					<Base {...props} />
				</span>
			}
			horizontalAlign={Flyout.ALIGNMENTS.LEFT_OR_RIGHT}
			open={search != null && focused}
			focusOnOpen={false}
			{...(SuggestionsCmp?.getFlyoutProps?.() || {})}
		>
			<SuggestionsCmp search={search} applySuggestion={applySuggestion} />
		</Flyout.Triggered>
	);
}
