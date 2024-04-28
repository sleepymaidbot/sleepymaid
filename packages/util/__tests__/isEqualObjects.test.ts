import { isEqualObjects } from "../src/isEqualObjects";
import { describe, test, expect } from "vitest";

describe("isEqualObjects", () => {
	test("GIVEN two objects with same keys and values THEN returns true", () => {
		expect(isEqualObjects({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
	});
	test("GIVEN two objects with same keys and different values THEN returns false", () => {
		expect(isEqualObjects({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
	});
	test("GIVEN two objects with different keys and same values THEN returns false", () => {
		expect(isEqualObjects({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
	});
	test("GIVEN two objects with different keys and different values THEN returns false", () => {
		expect(isEqualObjects({ a: 1, b: 2 }, { a: 1, c: 3 })).toBe(false);
	});
	test("GIVEN two objects with same keys and values but different order THEN returns true", () => {
		expect(isEqualObjects({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
	});
});
