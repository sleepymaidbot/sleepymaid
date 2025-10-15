/* eslint-disable no-restricted-globals */
/* eslint-disable n/prefer-global/process */
/* eslint-disable unicorn/prefer-module */
import { resolve } from "node:path";
import { createDrizzleInstance, DrizzleInstance } from "@sleepymaid/db";
import { BaseContainer, HandlerClient } from "@sleepymaid/handler";
import { Logger } from "@sleepymaid/logger";
import { GatewayIntentBits } from "discord-api-types/v10";
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import SleepyMaidContainer from "./SleepyMaidContainer";
import { Config, initConfig, supportedLngs } from "@sleepymaid/shared";

export class SleepyMaidClient extends HandlerClient {
	declare public drizzle: DrizzleInstance;

	declare public config: Config;

	declare public container: BaseContainer<this> & SleepyMaidContainer;

	declare public logger: Logger;

	public constructor() {
		super(
			{
				devServerId: "821717486217986098",
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildModeration,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.MessageContent,
				],
				allowedMentions: { parse: ["users", "roles"], repliedUser: false },
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.env = this.config.nodeEnv;
		this.logger = new Logger(this.env, this.config.discordWebhookUrl);

		this.drizzle = createDrizzleInstance(process.env.DATABASE_URL as string);

		await i18next.use(FsBackend).init({
			// debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: resolve(__dirname, "../../../../locales/sleepymaid/{{lng}}/{{ns}}.json"),
			},
			cleanCode: true,
			fallbackLng: "en-US",
			preload: ["en-US", "fr"],
			defaultNS: "translation",
			ns: "translation",
		});

		// Override container type
		this.container = new SleepyMaidContainer(this) as BaseContainer<this> & SleepyMaidContainer;

		this.loadHandlers({
			commands: {
				folder: resolve(__dirname, "..", "commands"),
			},
			listeners: {
				folder: resolve(__dirname, "..", "listeners"),
			},
			tasks: {
				folder: resolve(__dirname, "..", "tasks"),
			},
		});

		void this.login(this.config.discordToken);

		process.on("unhandledRejection", (error: Error) => {
			this.logger.error(error);
		});
	}
}
