import { readdir } from 'fs/promises'
import { resolve } from 'path'
import { langList, supportedLanguages } from './langList'
import { Collection } from '@discordjs/collection'
import { isObject } from '@sapphire/utilities'

export class Localizer {
	private declare locales: Collection<supportedLanguages, object>
	constructor() {
		this.locales = new Collection()
	}

	public async loadLanguage() {
		const folder = await readdir(resolve(__dirname, '../../../locales'))
		folder.forEach(async (file) => {
			const lang: supportedLanguages = file.split(
				'.'
			)[0] as unknown as supportedLanguages
			if (lang in supportedLanguages === false) return
			this.locales.set(lang, {})
			const strings = await import(
				resolve(__dirname, `../../../locales/${file}`)
			)
			for (const string of Object.keys(strings.default)) {
				if (isObject(strings.default[string])) {
					this.loadObject(string, strings.default[string], lang)
				} else {
					this.locales.set(lang, {
						...this.locales.get(lang),
						[string]: strings.default[string]
					})
				}
			}
		})
	}

	private loadObject(name: string, object: object, lang: supportedLanguages) {
		for (const string of Object.keys(object)) {
			if (isObject(object[string])) {
				this.loadObject(name + '.' + string, object[string], lang)
			} else {
				const obj = this.locales.get(lang)
				obj[name + '.' + string] = object[string]
				this.locales.set(lang, obj)
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public get(key: string, options?: any): string {
		const string =
			this.locales.get(langList[options.lng] ?? 'en-US')?.[key] ??
			this.locales.get(supportedLanguages['en-US'])?.[key]

		return (
			string.replace(/{{([^}]+)}}/g, (_, match) => {
				return options[match] ?? ''
			}) ?? key
		)
	}
}
