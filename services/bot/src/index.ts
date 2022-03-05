import { GatewayIntentBits, ActivityType } from 'discord.js'
import { BotClient } from './lib/BotClient'

const client: BotClient = new BotClient(
	{
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildBans,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessages
		],
		allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
		presence: {
			status: 'online',
			activities: [
				{
					name: 'yo allo ?',
					type: ActivityType.Watching
				}
			]
		}
	},
	{
		botName: 'Sleepy Maid',
		commandFolder: '../slashCommands'
	}
)

client.startAll()
