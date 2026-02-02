import type { Config } from "drizzle-kit"
import connectionString from "./env"

function getConnectionString(): string {
	if (typeof process.env.DATABASE_URL === "string") return process.env.DATABASE_URL
	else return connectionString
}

function getEnv(): string {
	if (typeof process.env.NODE_ENV === "string") return process.env.NODE_ENV
	else return "development"
}

function isDev(): boolean {
	return getEnv() === "development"
}

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
		url: getConnectionString(),
	},
	strict: !isDev(),
	verbose: isDev(),
} satisfies Config
