import { config } from '@sleepymaid-ts/config'
import { HandlerClient } from '@sleepymaid-ts/handler'
import { GatewayIntentBits } from 'discord.js'
import { resolve } from 'path'

const client = new HandlerClient(
	{
		devServerId: '821717486217986098'
	},
	{
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildBans,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessages
		]
	}
)

client.on('ready', async () => {
	client.logger.info('Ready!')
	await client.loadCommands(resolve(__dirname, './commands'))
	await client.loadEvents(resolve(__dirname, './listeners'))
})

client.login(config.token)
