import { addAliases } from "module-alias";
import { join } from "path";

export function setupModuleAliases() {
	const rootDir = process.cwd();

	addAliases({
		"@": join(rootDir, "dist"),
		// Add any other aliases you need
	});

	// Log the configuration for debugging
	console.log("Module aliases configured with root:", rootDir);
	console.log("@ points to:", join(rootDir, "dist"));
}
