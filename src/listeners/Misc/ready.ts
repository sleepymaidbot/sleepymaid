module.exports = {
	name: 'ready',
	once: true,

	async execute(client) {
		await client.logger.info(
			`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
		)

		await client.guilds
			.fetch()
			.then(async (guilds) => {
				for (const guild of guilds.values()) {
					const g = await client.guilds.fetch(guild.id)
					await g.members.fetch().catch((e) => client.logger.error(e))
				}
			})
			.catch((e) => client.logger.error(e))
	}
}
