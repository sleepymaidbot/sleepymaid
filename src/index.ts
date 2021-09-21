import { BotClient } from './lib/extensions/BotClient'
import { config } from './config/config'
import { Intents } from 'discord.js'

const myIntents = new Intents([
	'GUILDS',
	'GUILD_MEMBERS',
	'GUILD_BANS',
	'GUILD_VOICE_STATES',
	'GUILD_MESSAGES'
])

const client: BotClient = new BotClient({
	intents: myIntents,
	allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
	presence: {
		status: 'online',
		activities: [
			{
				name: 'yo allo ?',
				type: 'WATCHING'
			}
		]
	}
})

;(async () => {
	client.loadEvents()
	client.loadDB()
	client.login(config.token)
	client.loadTasks()
	client.loadCommands()
})()
