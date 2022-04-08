import { Listener } from '@sleepymaid-ts/handler'
export default new Listener(
	{
		name: 'interactionCreate',
		once: false
	},
	{
		run: async function run(client, interaction) {
			client.logger.info('Listener ran', interaction)
		}
	}
)
