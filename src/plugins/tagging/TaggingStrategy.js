import {BLOCK_SET, MUTABILITY} from '../../Constants';

const IsNonWhiteSpace = /\S/;

function buildIsValidMember ({allowWhiteSpace = false}) {
	if (allowWhiteSpace) { return () => true; }

	return (chars) => IsNonWhiteSpace.test(chars);
}

//NOTE: Facebook tagging gets the search term
//from the @ character to wherever the cursor is

export default class TaggingStrategy {
	#index = -1;
	#trigger = null;
	#type = null;
	#mutability = null;
	#allowedInBlockTypes = null;

	#DisplayCmp = null;

	#SuggestionsCmp = null;
	#suggestedOnly = true;

	#isValidMember = null;

	constructor ({
		trigger,
		type,
		mutability = MUTABILITY.MUTABLE,
		allowedInBlockTypes = BLOCK_SET,
		DisplayCmp,
		SuggestionsCmp,
		suggestedOnly,
		...config
	}) {
		if (!trigger) { throw new Error('Tagging Strategies must be given a trigger.'); }
		if (!type) { throw new Error('Tagging Strategies must be given a type.'); }

		this.#trigger = trigger;
		this.#type = type;
		this.#mutability = mutability;
		this.#allowedInBlockTypes = allowedInBlockTypes;

		this.#DisplayCmp = DisplayCmp;

		this.#SuggestionsCmp = SuggestionsCmp;
		this.#suggestedOnly = suggestedOnly;

		this.#isValidMember = buildIsValidMember(config);
	}

	set index (i) { this.#index = i; }

	get trigger () { return this.#trigger; }
	get type () { return this.#type; }
	get mutability () { return this.#mutability; }
	get allowedInBlockTypes () { return this.#allowedInBlockTypes; }

	get DisplayCmp () { return this.#DisplayCmp; }

	get hasSuggestions () { return Boolean(this.#SuggestionsCmp); }
	get SuggestionsCmp () { return this.#SuggestionsCmp; }
	get suggestedOnly () { return this.#suggestedOnly; }

	getId () {
		return `tagging-strategy-${this.trigger}-${this.type}-${this.index}`;
	}

	getEntityData () {
		return {
			id: this.getId()
		};
	}

	coversEntity (entity) {
		return entity?.getType() === this.type && entity?.getData()?.id === this.getId();
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