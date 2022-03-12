import { readdirSync } from 'fs'

export default class Util {
	public static async loadFolder(folder: string): Promise<string[]> {
		const fsfolder = readdirSync(folder)
		const files = []
		for (const file of fsfolder) {
			if (file.endsWith('.js')) {
				files.push(`${folder}/${file}`)
			} else if (file.endsWith('.disable')) continue
			else {
				files.push(...(await this.loadFolder(`${folder}/${file}`)))
			}
		}
		return files
	}
}
