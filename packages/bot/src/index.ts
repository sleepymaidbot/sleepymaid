import { GatewayIntentBits } from 'discord.js'
import { ActivityType } from 'discord-api-types/v9'
import { BotClient } from './lib/extensions/BotClient'

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
		commandFolder: '../../slashCommands'
	}
)

client.startAll()
