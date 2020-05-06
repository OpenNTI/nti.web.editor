import React from 'react';
import PropTypes from 'prop-types';
import {Flyout} from '@nti/web-commons';

import {Suggestions} from '../../utils';

import Base from './Base';

ClosedSuggestionTag.handlesStrategy = strat => strat.hasSuggestions && strat.suggestedOnly;
ClosedSuggestionTag.propTypes = {
	strategy: PropTypes.shape({
		SuggestionsCmp: PropTypes.any
	}),
	entityKey: PropTypes.string,
	blockKey: PropTypes.string,
	offsetKey: PropTypes.string,
	subscribeToSelection: PropTypes.func,
	getEditorState: PropTypes.func,
	setEditorState: PropTypes.func
};
export default function ClosedSuggestionTag (props) {
	const {strategy, entityKey, blockKey, offsetKey, subscribeToSelection, getEditorState, setEditorState} = props;

	const [selection, setSelection] = React.useState(null);

	React.useEffect(() => {
		return subscribeToSelection(setSelection);
	}, []);

	const editorState = getEditorState();
	const suggestionArgs = [strategy, entityKey, blockKey, offsetKey, editorState, selection];

	const suggestion = Suggestions.getSuggestion(...suggestionArgs);

	if (suggestion) {
		return (<Base {...props} />);
	}

	const {SuggestionsCmp} = strategy;

	const search = Suggestions.getSuggestionSearch(...suggestionArgs);
	const applySuggestion = newSuggestion => setEditorState(Suggestions.setSuggestion(newSuggestion, search, ...suggestionArgs));

	return (
		<Flyout.Triggered
			trigger={(<span><Base {...props} /></span>)}
			verticalAlign={Flyout.ALIGNMENTS.BOTTOM}
			horizontalAlign={Flyout.ALIGNMENTS.LEFT}
			open={search != null}
			focusOnOpen={false}
		>
			<SuggestionsCmp search={search} applySuggestion={applySuggestion} />
		</Flyout.Triggered>
	);
}