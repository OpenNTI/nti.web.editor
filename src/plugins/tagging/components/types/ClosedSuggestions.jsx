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
	getEditorState: PropTypes.func
};
export default function ClosedSuggestionTag (props) {
	const {strategy, entityKey, blockKey, offsetKey, subscribeToSelection, getEditorState} = props;

	const [selection, setSelection] = React.useState(null);

	React.useEffect(() => {
		return subscribeToSelection(setSelection);
	}, []);

	const editorState = getEditorState();
	const suggestion = Suggestions.getSuggestion(strategy, entityKey, blockKey, offsetKey, editorState, selection);

	if (suggestion) {
		return (
			<span>
				Suggestion
			</span>
		);
	}

	const {SuggestionsCmp} = strategy;

	const search = Suggestions.getSuggestionSearch(strategy, entityKey, blockKey, offsetKey, editorState, selection);
	const applySuggestion = (newSuggestion) => {
		debugger;
	};

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