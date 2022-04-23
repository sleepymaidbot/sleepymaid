import { Snowflake } from 'discord-api-types/v10'
import { readdir } from 'fs/promises'
import { resolve } from 'path'

export interface Configs {
	[key: string]: BaseConfig
}

export class ConfigManager {
	public declare configs: Configs
	constructor() {
		this.configs = {}
	}
	public async initConfig(): Promise<Configs> {
		const files = await readdir(resolve(__dirname, './config'))
		for (const file of files) {
			if (file.endsWith('.js')) {
				const config = await import(`./config/${file}`)
				this.configs[file.replace('.js', '')] = {
					...config.config,
					token:
						config.config.environment === 'production'
							? config.config.credentials.token
							: config.config.credentials.devToken
				}
			}
		}
		return this.configs
	}
}

export interface ConfigOptions {
	credentials: { token: string; devToken: string }
	environment: 'production' | 'development'
	owners: Snowflake[]
	prefix: string
	db: string
}

export class BaseConfig {
	public credentials: { token: string; devToken: string }
	public environment: 'production' | 'development'
	public owners: Snowflake[]
	public prefix: string
	public db: string
	public token: string

	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials
		this.environment = options.environment
		this.owners = options.owners
		this.prefix = options.prefix
		this.db = options.db
	}
}
