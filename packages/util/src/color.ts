/**
 * Converts a number to a hex color code
 * @param value Number
 * @returns Hex color code
 */
export function intToHexColor(value: number): string {
	value = Math.max(0, Math.min(16777215, value))

	const r = ((value >> 16) & 0xff).toString(16).padStart(2, "0")
	const g = ((value >> 8) & 0xff).toString(16).padStart(2, "0")
	const b = (value & 0xff).toString(16).padStart(2, "0")

	return `#${r}${g}${b}`
}
