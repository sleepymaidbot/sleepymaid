import { describe, expect, test } from "vitest"
import { getTimeTable } from "../src/time"

describe("getTimeTable", () => {
	test("GIVEN a string THEN returns a duration object", () => {
		expect(getTimeTable("76d 12h 34m 56s")).toEqual({ days: 76, hours: 12, minutes: 34, seconds: 56 })
	})
	test("GIVEN a string with invalid units THEN returns a duration object with only valid units", () => {
		expect(getTimeTable("76d 12h 34m 56s 78x")).toEqual({ days: 76, hours: 12, minutes: 34, seconds: 56 })
	})
	test("GIVEN a string with invalid units THEN returns a duration object with only valid units", () => {
		expect(getTimeTable("76d 12h 34m 56s 78x")).toEqual({ days: 76, hours: 12, minutes: 34, seconds: 56 })
	})
	test("GIVEN a string with only minutes THEN returns a duration object with only minutes", () => {
		expect(getTimeTable("34m")).toEqual({ minutes: 34 })
	})
})
