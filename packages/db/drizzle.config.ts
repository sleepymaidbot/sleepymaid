import type { Config } from 'drizzle-kit';
import connectionString from './env';

export default {
	schema: ['./src/schema/sleepymaid/*.ts', './src/schema/helper/*.ts'],
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: connectionString,
	},
	strict: true,
} satisfies Config;
