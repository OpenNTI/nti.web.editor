export const BLOCKS = {
	ATOMIC: 'atomic',
	BLOCKQUOTE: 'blockquote',
	CODE: 'code-block',
	HEADER_FIVE: 'header-five',
	HEADER_FOUR: 'header-four',
	HEADER_ONE: 'header-one',
	HEADER_SIX: 'header-six',
	HEADER_THREE: 'header-three',
	HEADER_TWO: 'header-two',
	ORDERED_LIST_ITEM: 'ordered-list-item',
	PULLQUOTE: 'pullquote',
	UNORDERED_LIST_ITEM: 'unordered-list-item',
	UNSTYLED: 'unstyled',
};

export const STYLES = {
	BOLD: 'BOLD',
	CODE: 'CODE',
	ITALIC: 'ITALIC',
	STRIKETHROUGH: 'STRIKETHROUGH',
	UNDERLINE: 'UNDERLINE',
};

export const ENTITIES = {
	LINK: 'LINK',
	IMAGE: 'IMAGE',
	TAG: 'TAG',
	MENTION: 'MENTION',
};

export const MUTABILITY = {
	MUTABLE: 'MUTABLE',
	IMMUTABLE: 'IMMUTABLE',
	SEGMENTED: 'SEGMENTED',
};

export const STYLE_SET = new Set([
	STYLES.BOLD,
	STYLES.CODE,
	STYLES.ITALIC,
	STYLES.STRIKETHROUGH,
	STYLES.UNDERLINE,
]);

export const BLOCK_SET = new Set([
	BLOCKS.ATOMIC,
	BLOCKS.BLOCKQUOTE,
	BLOCKS.CODE,
	BLOCKS.HEADER_FIVE,
	BLOCKS.HEADER_FOUR,
	BLOCKS.HEADER_ONE,
	BLOCKS.HEADER_SIX,
	BLOCKS.HEADER_THREE,
	BLOCKS.HEADER_TWO,
	BLOCKS.ORDERED_LIST_ITEM,
	BLOCKS.PULLQUOTE,
	BLOCKS.UNORDERED_LIST_ITEM,
	BLOCKS.UNSTYLED,
]);

export const CHANGE_TYPES = {
	ADJUST_DEPTH: 'adjust-depth',
	APPLY_ENTITY: 'apply-entity',
	BACKAPCE_CHARACTER: 'backspace-character',
	CHANGE_BLOCK_DATA: 'change-block-data',
	CHANGE_BLOCK_TYPE: 'change-block-type',
	CHANGE_INLINE_STYLE: 'change-inline-style',
	MOVE_BLOCK: 'move-block',
	DELETE_CHARACTER: 'delete-character',
	INSERT_CHARACTERS: 'insert-characters',
	INSERT_FRAGMENT: 'insert-fragment',
	REDO: 'redo',
	REMOVE_RANGE: 'remove-range',
	SPELLCHECK_CHANGE: 'spellcheck-change',
	SPLIT_BLOCK: 'split-block',
	UNDO: 'undo',
};

//TODO: point all the references to draft-js-utils to constants in here,
//then remove the dependency on draft-js-utils
