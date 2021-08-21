import { Snowflake } from 'discord.js'

export interface ConfigOptions {
	credentials: { token: string; devToken: string }
	environment: 'production' | 'development'
	owners: Snowflake[]
	prefix: string
	devprefix: string
	slashprefix: string
	db: string
}

export class Config {
	public credentials: { token: string; devToken: string }
	public environment: 'production' | 'development'
	public owners: Snowflake[]
	public prefix: string
	public devprefix: string
	public slashprefix: string
	public db: string

	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials
		this.environment = options.environment
		this.owners = options.owners
		this.prefix = options.prefix
		this.devprefix = options.devprefix
		this.slashprefix = options.slashprefix
		this.db = options.db
	}

	public get token(): string {
		return this.environment === 'production'
			? this.credentials.token
			: this.credentials.devToken
	}

	public get isProduction(): boolean {
		return this.environment === 'production'
	}

	public get isDevelopment(): boolean {
		return this.environment === 'development'
	}
}
