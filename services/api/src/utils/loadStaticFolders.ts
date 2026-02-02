import { readdirSync } from "fs"
import { join } from "path"

/**
 * Loads all folder names from the ./static/images directory
 * @returns Array of folder names found in ./static/images
 * @throws Error if ./static/images directory doesn't exist or can't be read
 */
function loadImageFolders(): string[] {
	try {
		const imagesPath = join(process.cwd(), "static", "images")
		const items = readdirSync(imagesPath, { withFileTypes: true })

		// Filter only directories and return their names
		return items.filter((item) => item.isDirectory()).map((dir) => dir.name)
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to load image folders: ${error.message}`)
		}
		throw error
	}
}

export default loadImageFolders
