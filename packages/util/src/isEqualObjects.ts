/**
 *
 * @param a Object
 * @param b Object
 * @returns {boolean} True if the objects are equal
 */
export function isEqualObjects(a: { [key: string]: any }, b: { [key: string]: any }): boolean {
	// if the number of keys is different, they are different
	if (Object.keys(a).length !== Object.keys(b).length) {
		return false;
	}

	for (const key in a) {
		const a_value = a[key];
		const b_value = b[key];
		// If the value is an object, check if they're different objects
		// If it isn't, uses !== to check
		if (
			(a_value instanceof Object && !isEqualObjects(a_value, b_value)) ||
			(!(a_value instanceof Object) && a_value !== b_value)
		) {
			return false;
		}
	}
	return true;
}
