import { readdir } from 'fs/promises'
import { resolve } from 'path'
import { langList, supportedLanguages } from './langList'
import { Collection } from '@discordjs/collection'

export class Localizer {
	private declare locales: Collection<supportedLanguages, object>
	constructor() {
		this.locales = new Collection()
	}

	public async loadLanguage() {
		const folder = await readdir(resolve(__dirname, '../../../locales'))
		folder.forEach(async (file) => {
			const lang = file.split('.')[0]
			if (lang in supportedLanguages === false) return
			const string = await import(
				resolve(__dirname, `../../../locales/${file}`)
			)
			this.locales.set(lang as unknown as supportedLanguages, string)
		})
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
