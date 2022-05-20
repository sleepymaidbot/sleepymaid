import { exec } from 'child_process'
import { readdirSync } from 'fs'
import { promisify } from 'util'

export default class Util {
	/**
	 *
	 * @param folder The folder to read
	 * @returns The files in the folder and subfolders
	 */
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

	/**
	 * Runs a shell command and gives the output
	 * @param command The shell command to run
	 * @returns The stdout and stderr of the shell command
	 */
	public async shell(command: string): Promise<{
		stdout: string
		stderr: string
	}> {
		return await promisify(exec)(command)
	}
}
