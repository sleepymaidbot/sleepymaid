import { readdirSync } from 'fs'

/**
 *
 * @param folder The folder to read
 * @returns The files in the folder and subfolders
 */
export async function loadFolder(folder: string): Promise<string[]> {
	const fsfolder = readdirSync(folder)
	const files = []
	for (const file of fsfolder) {
		if (file.endsWith('.js')) {
			files.push(`${folder}/${file}`)
		} else if (file.endsWith('.disable')) continue
		else {
			files.push(...(await loadFolder(`${folder}/${file}`)))
		}
	}
	return files
}
