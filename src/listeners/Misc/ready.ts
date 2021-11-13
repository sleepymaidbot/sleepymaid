module.exports = {
	name: 'ready',
	once: true,

	async execute(client) {
		await client.logger.info(
			`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
		)
	}
}
