import { describe, expect, test } from "vitest"
import { intToHexColor } from "../src/color"

describe("intToHexColor", () => {
	test("GIVEN a number THEN returns a hex color code", () => {
		expect(intToHexColor(11096782)).toEqual("#a952ce")
	})
})
