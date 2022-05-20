import { exec } from 'child_process'
import { readdirSync } from 'fs'
import { promisify } from 'util'

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

	public async shell(command: string): Promise<{
		stdout: string
		stderr: string
	}> {
		return await promisify(exec)(command)
	}
}
