import 'reflect-metadata'
import { exec as MyExec } from 'child_process'
import { Message } from 'discord.js'
import path from 'path'
import { container } from 'tsyringe'
import { promisify } from 'util'
import { BotClient } from '../../lib/BotClient'
import { voiceXpManager } from '../../lib/managers/voiceXpManager'
import { Listener } from '@sleepymaid/handler'
const exec = promisify(MyExec)

export default new Listener(
	{
		name: 'messageCreate',
		once: false
	},
	{
		async run(message: Message, client: BotClient) {
			if (message.author.id !== '324281236728053760') return
			const content = message.content.split(' ')
			const cmd = content[0]
			if (!cmd.startsWith(client.config.prefix)) return
			switch (cmd.slice(1)) {
				case 'gitUpdate': {
					try {
						await message.channel.send('Updating...')
						client.logger.info('Stopping...')
						container.register(BotClient, { useValue: client })
						await container.resolve(voiceXpManager).stopAll()
						await client.prisma.$disconnect()
						await exec('sh gitUpdate.sh', {
							cwd: path.join(__dirname, '..', '..', '..', '..', '..')
						})
					} catch (error) {
						client.logger.error(error)
					}
				}
			}
		}
	}
)
