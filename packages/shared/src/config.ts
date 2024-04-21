/* eslint-disable @typescript-eslint/no-non-null-assertion */
import process from 'node:process';

export type NodeEnv = 'dev' | 'prod';
export type Config = {
	dbUrl: string;
	devIds: string[];
	discordClientId: string;
	discordClientSecret: string;
	discordToken: string;
	nodeEnv: NodeEnv;
	rabbitMQUrl: string;
	redisUrl: string;
};

export const initConfig = () => {
	const config: Config = {
		discordClientId: process.env.DISCORD_CLIENT_ID!,
		devIds: process.env.DEV_IDS?.split(',') ?? [],
		discordClientSecret: process.env.DISCORD_CLIENT_SECRET!,
		discordToken: process.env.DISCORD_TOKEN!,
		dbUrl: process.env.DB_URL!,
		rabbitMQUrl: process.env.RABBITMQ_URL!,
		redisUrl: process.env.REDIS_URL!,
		nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? 'dev',
	};
	return config;
};
