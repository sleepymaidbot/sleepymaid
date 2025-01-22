/* eslint-disable unicorn/prefer-module */
import { resolve } from "node:path";
import process from "node:process";
import { createDrizzleInstance, DrizzleInstance } from "@sleepymaid/db";
import { HandlerClient } from "@sleepymaid/handler";
import { Logger } from "@sleepymaid/logger";
import type { Config } from "@sleepymaid/shared";
import { initConfig, supportedLngs } from "@sleepymaid/shared";
import { GatewayIntentBits } from "discord-api-types/v10";
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";

export class TestClient extends HandlerClient {
	declare public drizzle: DrizzleInstance;

	declare public config: Config;

	public constructor() {
		super(
			{
				devServerId: "821717486217986098",
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.GuildVoiceStates,
				],
				allowedMentions: { parse: ["users", "roles"], repliedUser: false },
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.logger = new Logger(this.env);
		this.env = this.config.nodeEnv;

		this.drizzle = createDrizzleInstance(process.env.DATABASE_URL as string);

		await i18next.use(FsBackend).init({
			// debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: resolve(__dirname, "../../../../../locales/watcher/{{lng}}/{{ns}}.json"),
			},
			cleanCode: true,
			fallbackLng: "en-US",
			preload: ["en-US", "fr"],
			defaultNS: "translation",
			ns: "translation",
		});

		void this.loadHandlers({
			commands: {
				folder: resolve(__dirname, "..", "..", "commands"),
			},
			listeners: {
				folder: resolve(__dirname, "..", "..", "listeners"),
			},
			tasks: {
				folder: resolve(__dirname, "..", "..", "tasks"),
			},
		});

		void this.login(this.config.discordToken);

		process.on("unhandledRejection", (error: Error) => {
			this.logger.error(error);
		});
	}
}
