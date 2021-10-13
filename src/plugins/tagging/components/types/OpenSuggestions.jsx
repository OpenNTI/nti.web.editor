
import Base from './Base';

OpenSuggestionTag.handlesStrategy = strat =>
	strat.hasSuggestions && !strat.suggestedOnly;
export default function OpenSuggestionTag(props) {
	return <Base {...props} />;
}
