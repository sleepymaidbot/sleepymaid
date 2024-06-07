import type { Config } from "drizzle-kit";
import connectionString from "./env";

export default {
	schema: [
		"./src/schema/helper/*.ts",
		"./src/schema/sleepymaid/*.ts",
		"./src/schema/watcher/*.ts",
		"./src/schema/*.ts",
	],
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: connectionString,
	},
	strict: true,
} satisfies Config;
