import { Locale } from 'discord-api-types/v10'
import i18next from 'i18next'

export const supportedLngs = ['en-US', 'fr']

type PropAsIndexSignature<T extends string> = {
	[P in T]: string
}
type StringAsLocalizations<T extends string> = `${T}_localizations`
type PropAsIndexSignatureLocalizations<T extends string> = {
	[P in StringAsLocalizations<T>]: Record<Locale, string>
}

type LocalizedProp<T extends string> = PropAsIndexSignature<T> &
	PropAsIndexSignatureLocalizations<T>

export function getLocalizedProp<Prop extends string>(prop: Prop, key: string) {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {
		[prop]: i18next.t(key),
		[`${prop}_localizations`]: Object.fromEntries(
			Object.values(Locale)
				.filter((locale) => supportedLngs.includes(locale))
				.map((locale) => [locale, i18next.t(key, { lng: locale })])
		)
	} as LocalizedProp<Prop>
}
