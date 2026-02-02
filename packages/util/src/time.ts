import type { Duration } from "date-fns"

const validUnits: Record<string, keyof Duration> = {
	d: "days",
	h: "hours",
	m: "minutes",
	s: "seconds",
}

const fullUnits: Record<keyof Duration, keyof Duration> = {
	days: "days",
	hours: "hours",
	minutes: "minutes",
	seconds: "seconds",
	years: "years",
	months: "months",
	weeks: "weeks",
}

/**
 * Parses a time string into a duration object
 * @param input The time string to parse
 * @returns The duration object
 */
export function getTimeTable(input: string): Duration {
	const response: Duration = {}

	const split = input.split(" ")

	for (const part of split) {
		let type = part[part.length - 1] as keyof Duration
		let time

		const parts = part.split(/(\d+)/)
		for (const part of parts) {
			if (part.length === 0) continue
			if (/^\d+$/.test(part)) {
				const value = parseInt(part, 10)
				if (type in validUnits) {
					time = value
				} else if (type in fullUnits) {
					time = value
				}
			} else {
				if (part in validUnits) {
					type = validUnits[part] as keyof Duration
				}
			}
		}

		if (type in fullUnits) {
			response[fullUnits[type]] = time
		}
	}

	return response
}
