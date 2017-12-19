/* eslint-env jest */
import {BLOCKS} from '../../../../Constants';
import generateChecksFor from '../generate-checks-for';

const around = new Set([BLOCKS.CODE]);
const between = new Set([BLOCKS.ATOMIC]);

describe('generateChecksFor', () => {
	describe('isFocusable', () => {
		test('True if not in around or between', () => {
			const {isFocusable} = generateChecksFor(around, between);

			expect(isFocusable({type: BLOCKS.UNSTYLE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_ONE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_TWO})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_THREE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_FOUR})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_FIVE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.HEADER_SIX})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.BLOCK_QUOTE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.PULL_QUOTE})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.ORDERED_LIST_ITEM})).toBeTruthy();
			expect(isFocusable({type: BLOCKS.UNORDERED_LIST_ITEM})).toBeTruthy();
		});

		test('False if in around', () => {
			const {isFocusable} =  generateChecksFor(around, between);

			expect(isFocusable({type: BLOCKS.CODE})).toBeFalsy();
		});

		test('False if in between', () => {
			const {isFocusable} =  generateChecksFor(around, between);

			expect(isFocusable({type: BLOCKS.ATOMIC})).toBeFalsy();
		});
	});

	describe('shouldInsertAround', () => {
		test('False if not in around', () => {
			const {shouldInsertAround} = generateChecksFor(around, between);

			expect(shouldInsertAround({type: BLOCKS.ATOMIC}, null)).toBeFalsy();
		});

		test('False if prev is the same type', () => {
			const {shouldInsertAround} = generateChecksFor(around, between);

			expect(shouldInsertAround({type: BLOCKS.CODE}, {type: BLOCKS.CODE})).toBeFalsy();
		});

		test('False if the prev is focusable', () => {
			const {shouldInsertAround} = generateChecksFor(around, between);

			expect(shouldInsertAround({type: BLOCKS.CODE}, {type: BLOCKS.UNSTYLED})).toBeFalsy();
		});

		test('True if in around and prev is not same and not focusable', () => {
			const {shouldInsertAround} = generateChecksFor(around, between);

			expect(shouldInsertAround({type: BLOCKS.CODE}, {type: BLOCKS.ATOMIC})).toBeTruthy();
		});
	});

	describe('shouldInsertBetween', () => {
		test('False if not in before', () => {
			const {shouldInsertBetween} = generateChecksFor(around, between);

			expect(shouldInsertBetween({type: BLOCKS.CODE}, null)).toBeFalsy();
		});

		test('False if prev is focusable', () => {
			const {shouldInsertBetween} = generateChecksFor(around, between);

			expect(shouldInsertBetween({type: BLOCKS.ATOMIC}, {type: BLOCKS.UNSTYLED})).toBeFalsy();
		});

		test('True if prev is not focusable', () => {
			const {shouldInsertBetween} = generateChecksFor(around, between);

			expect(shouldInsertBetween({type: BLOCKS.ATOMIC}, {type: BLOCKS.ATOMIC})).toBeTruthy();
		});
	});

	describe('shouldInsertBefore', () => {
		test('True if no prev block and not focusable', () => {
			const {shouldInsertBefore} = generateChecksFor(around, between);

			expect(shouldInsertBefore({type: BLOCKS.CODE}, null)).toBeTruthy();
		});

		test('True if shouldInsertAround is true', () => {
			const {shouldInsertBefore} = generateChecksFor(around, between);

			expect(shouldInsertBefore({type: BLOCKS.CODE}, {type: BLOCKS.ATOMIC})).toBeTruthy();
		});

		test('True if shouldInsertBetween is true', () => {
			const {shouldInsertBefore} = generateChecksFor(around, between);

			expect(shouldInsertBefore({type: BLOCKS.ATOMIC}, {type: BLOCKS.ATOMIC})).toBeTruthy();
		});

		test('False for focusable block', () => {
			const {shouldInsertBefore} = generateChecksFor(around, between);

			expect(shouldInsertBefore({type: BLOCKS.UNSTYLED}, {type: BLOCKS.UNSTYLED})).toBeFalsy();
		});
	});
});
