import { Snowflake } from 'discord.js'

export interface ConfigOptions {
	credentials: { token: string; devToken: string }
	clientId: { prod: string; dev: string }
	environment: 'production' | 'development'
	owners: Snowflake[]
	prefix: string
	devprefix: string
	db: string
}

export class Config {
	public credentials: { token: string; devToken: string }
	public clientId: { prod: string; dev: string }
	public environment: 'production' | 'development'
	public owners: Snowflake[]
	public prefix: string
	public devprefix: string
	public db: string

	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials
		this.clientId = options.clientId
		this.environment = options.environment
		this.owners = options.owners
		this.prefix = options.prefix
		this.devprefix = options.devprefix
		this.db = options.db
	}

	public get token(): string {
		return this.environment === 'production'
			? this.credentials.token
			: this.credentials.devToken
	}

	public get envClientId(): string {
		return this.environment === 'production'
			? this.clientId.prod
			: this.clientId.dev
	}

	public get isProduction(): boolean {
		return this.environment === 'production'
	}

	public get isDevelopment(): boolean {
		return this.environment === 'development'
	}
}
