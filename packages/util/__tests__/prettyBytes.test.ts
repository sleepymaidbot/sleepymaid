import { describe, expect, test } from "vitest"
import { prettyBytes } from "../src/prettyBytes"

describe("prettyBytes", () => {
	test("GIVEN a number with binary option as true THEN returns a string ", () => {
		expect(
			prettyBytes(1000, {
				binary: true,
			}),
		).toBe("1000 B")
		expect(prettyBytes(1024, { binary: true })).toBe("1 kiB")
	})
	test("GIVEN a number with bits option as true THEN returns a string ", () => {
		expect(prettyBytes(1337, { bits: true })).toBe("1.34 kbit")
	})
	// test("GIVEN a number with minimumFractionDigits option as 3 THEN returns a string ", () => {
	// 	expect(prettyBytes(1900, { minimumFractionDigits: 3 })).toBe("1,900 kB");
	// });
})
