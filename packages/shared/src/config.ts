/* eslint-disable @typescript-eslint/no-non-null-assertion */

export type NodeEnv = 'dev' | 'prod';
export interface Config {
	discordClientId: string;
	discordClientSecret: string;
	discordToken: string;
	devIds: string[];
	dbUrl: string;
	redisUrl: string;
	nodeEnv: NodeEnv;
}

export const initConfig = () => {
	const config: Config = {
		discordClientId: process.env.DISCORD_CLIENT_ID!,
		devIds: process.env.DEV_IDS?.split(',') ?? [],
		discordClientSecret: process.env.DISCORD_CLIENT_SECRET!,
		discordToken: process.env.DISCORD_TOKEN!,
		dbUrl: process.env.DB_URL!,
		redisUrl: process.env.REDIS_URL!,
		nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? 'dev',
	};
	return config;
};
