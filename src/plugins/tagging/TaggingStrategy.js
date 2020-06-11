import {BLOCK_SET, MUTABILITY} from '../../Constants';

const IsNonWhiteSpace = /\S/;

function buildIsValidMember ({allowWhiteSpace = false}) {
	if (allowWhiteSpace) { return () => true; }

	return (chars) => IsNonWhiteSpace.test(chars);
}

function getDefaultMutability ({suggestedOnly}) {
	return suggestedOnly ? MUTABILITY.IMMUTABLE : MUTABILITY.MUTABLE;
}

//NOTE: Facebook tagging gets the search term
//from the @ character to wherever the cursor is

export default class TaggingStrategy {
	#key = -1;
	#trigger = null;
	#type = null;
	#mutability = null;
	#allowedInBlockTypes = null;

	#DisplayCmp = null;
	#getDisplayText = null;
	#displayClassName = null;

	#SuggestionsCmp = null;
	#suggestedOnly = true;

	#isValidMember = null;

	constructor (configArg) {
		const {
			trigger,
			type,
			mutability,
			allowedInBlockTypes = BLOCK_SET,
			DisplayCmp,
			getDisplayText,
			displayClassName,
			SuggestionsCmp,
			suggestedOnly,
			...config
		} = configArg;

		if (!trigger) { throw new Error('Tagging Strategies must be given a trigger.'); }
		if (!type) { throw new Error('Tagging Strategies must be given a type.'); }

		this.#trigger = trigger;
		this.#type = type;
		this.#mutability = mutability || getDefaultMutability(configArg);
		this.#allowedInBlockTypes = allowedInBlockTypes;

		this.#DisplayCmp = DisplayCmp;
		this.#getDisplayText = getDisplayText;
		this.#displayClassName = displayClassName;

		this.#SuggestionsCmp = SuggestionsCmp;
		this.#suggestedOnly = suggestedOnly;

		this.#isValidMember = buildIsValidMember(config);
	}

	set key (i) { this.#key = i; }

	get trigger () { return this.#trigger; }
	get type () { return this.#type; }
	get mutability () { return this.#mutability; }
	get allowedInBlockTypes () { return this.#allowedInBlockTypes; }

	get DisplayCmp () { return this.#DisplayCmp; }
	get displayClassName () { return this.#displayClassName; }
	getDisplayText (suggestion) {
		return this.#getDisplayText?.(suggestion) ?? suggestion;
	}

	get hasSuggestions () { return Boolean(this.#SuggestionsCmp); }
	get SuggestionsCmp () { return this.#SuggestionsCmp; }
	get suggestedOnly () { return this.#suggestedOnly; }

	getId () {
		return `tagging-strategy-${this.trigger}-${this.type}-${this.key}`;
	}

	getEntityData () {
		return {
			id: this.getId()
		};
	}

	coversEntity (entity) {
		return entity?.type === this.type && entity?.data?.id === this.getId();
	}


	isValidStart (chars) {
		return chars.indexOf(this.trigger) === 0;
	}

	isValidContinuation (chars) {
		if (this.hasSuggestions && this.suggestedOnly) {
			return false;
		}

		return this.#isValidMember(chars);
	}

	isValidMember (chars) {
		return this.#isValidMember(chars);
	}
}