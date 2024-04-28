import type { Config } from 'drizzle-kit';
import connectionString from './env';

export default {
	schema: [
		'./src/schema/helper/*.ts',
		'./src/schema/sleepymaid/*.ts',
		'./src/schema/watcher/*.ts',
		'./src/schema/*.ts',
	],
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString,
	},
	strict: true,
} satisfies Config;
