import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

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
});
