/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Util {
	public static deepEquals<T>(
		a: unknown,
		b: T,
		options?: DeepEqualsOptions
	): a is T
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static deepEquals(
		a: any,
		b: any,
		options?: DeepEqualsOptions
	): boolean {
		const { ignoreUndefined = true, ignoreArrayOrder = true } = options ?? {}

		if (a === b) return true
		if (typeof a !== 'object' || typeof b !== 'object')
			throw new TypeError('Not objects')
		if (
			(Array.isArray(a) && !Array.isArray(b)) ||
			(!Array.isArray(a) && Array.isArray(b))
		)
			return false
		const newA =
			ignoreArrayOrder &&
			Array.isArray(a) &&
			a.length &&
			typeof a[0] !== 'object'
				? [...a].sort()
				: a
		const newB =
			ignoreArrayOrder &&
			Array.isArray(b) &&
			b.length &&
			typeof b[0] !== 'object'
				? [...b].sort()
				: b
		for (const key in newA) {
			if (ignoreUndefined && newA[key] === undefined && newB[key] === undefined)
				continue
			if (!(key in newB)) return false
			if (typeof newA[key] === 'object' && typeof newB[key] === 'object') {
				if (
					!this.deepEquals(newA[key], newB[key], {
						ignoreUndefined,
						ignoreArrayOrder
					})
				)
					return false
			} else if (newA[key] !== newB[key]) return false
		}
		return true
	}
}

export interface DeepEqualsOptions {
	ignoreUndefined?: boolean
	ignoreArrayOrder?: boolean
}
