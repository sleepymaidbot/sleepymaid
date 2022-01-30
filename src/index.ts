import { Intents } from 'discord.js'
import { BotClient } from './lib/extensions/BotClient'

const client: BotClient = new BotClient(
	{
		intents: new Intents([
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_BANS',
			'GUILD_VOICE_STATES',
			'GUILD_MESSAGES'
		]),
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
	},
	{
		botName: 'Sleepy Maid',
		commandFolder: '../../slashCommands'
	}
)

client.startAll()
