//import { PubSubRedisBroker } from '@discordjs/brokers';
import { Boom, isBoom, notFound } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';
import { findFilesRecursively } from '@sapphire/node-utilities';
import { Logger } from '@sleepymaid/logger';
import { Config, initConfig } from '@sleepymaid/shared';
import Redis from 'ioredis';
import path from 'node:path';
import Polka from 'polka';
import { sendBoom } from './util/sendBoom';

export default class Handler {
	public declare logger: Logger;
	public declare prisma: PrismaClient;
	public declare redis: Redis;
	//public declare brokers: PubSubRedisBroker<any>;
	public declare config: Config;
	constructor() {
		// ...
	}
	public async start(): Promise<void> {
		this.config = initConfig();
		this.logger = new Logger(this.config.nodeEnv);
		this.prisma = new PrismaClient();
		this.redis = new Redis(this.config.redisUrl);
		//this.brokers = new PubSubRedisBroker({ redisClient: this.redis });
		const logger = this.logger;
		Polka({
			onError(error: any, _: any, res) {
				res.setHeader('content-type', 'application/json');
				const boom = isBoom(error) ? error : new Boom(error);

				if (boom.output.statusCode === 500) {
					logger.error(boom, boom.message);
				}

				sendBoom(boom, res);
			},
			onNoMatch(_: any, res) {
				res.setHeader('content-type', 'application/json');
				sendBoom(notFound(), res);
			},
		});

		for await (const file of findFilesRecursively(path.join(__dirname, 'routes'), (filePath: string) =>
			filePath.endsWith('.js'),
		)) {
			console.log(file);
		}
	}
}
