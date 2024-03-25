import type { Config } from 'drizzle-kit';

export default {
	schema: ['./src/schema/sleepymaid/*.ts', './src/schema/helper/*.ts'],
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL!,
	},
	strict: true,
} satisfies Config;
