import { defineConfig } from "@tanstack/start/config"
import babel from "vite-plugin-babel"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	vite: {
		plugins: [
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			babel({
				babelConfig: {
					plugins: [["babel-plugin-react-compiler", {}]],
				},
			}),
		],
	},
})
