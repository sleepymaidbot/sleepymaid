import { intToHexColor } from "../src/color";
import { describe, test, expect } from "vitest";

describe("intToHexColor", () => {
	test("GIVEN a number THEN returns a hex color code", () => {
		expect(intToHexColor(11096782)).toEqual("#a952ce");
	});
});
