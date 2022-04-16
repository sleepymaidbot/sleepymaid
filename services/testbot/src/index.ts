import { config } from '@sleepymaid/config'
import { HandlerClient } from '@sleepymaid/handler'
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

client.loadHandlers({
	commands: {
		folder: resolve(__dirname, './commands')
	},
	listeners: {
		folder: resolve(__dirname, './listeners')
	},
	tasks: {
		folder: resolve(__dirname, './tasks')
	}
})

client.on('ready', async () => {
	client.logger.info('Ready!')
	/*await client.loadCommands(resolve(__dirname, './commands'))
	await client.loadListeners(resolve(__dirname, './listeners'))
	await client.loadTasks(resolve(__dirname, './tasks'))*/
})

client.login(config.token)
