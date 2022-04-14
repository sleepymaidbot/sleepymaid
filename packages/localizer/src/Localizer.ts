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
					const obj = this.locales.get(lang)
					obj[string] = strings.default[string]
					this.locales.set(lang, obj)
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
	public async get(key: string, options?: any) {
		const lng = langList[options.lng] ?? 'en-US'
		delete options.lng
		const string = (await this.locales.get(lng)?.[key]) ?? key

		return string.replace(/{{([^}]+)}}/g, (_, match) => {
			return options[match] ?? ''
		})
	}
}
