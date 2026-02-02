import { join } from "path"

/**
 * Configures module aliases for path resolution.
 * Not needed with Bun - kept for API compatibility.
 */
export function setupModuleAliases() {
	const rootDir = process.cwd()
	console.log("Module aliases configured with root:", rootDir)
	console.log("@ points to:", join(rootDir, "dist"))
}
