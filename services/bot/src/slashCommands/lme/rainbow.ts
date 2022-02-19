import { SlashCommandBuilder } from '@discordjs/builders'

let onCooldown = false

module.exports = {
	guildIds: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('rainbow')
		.setDescription('Change la couleur du rôle vraiment cool.')
		.toJSON(),

	async execute(interaction) {
		if (!interaction.member.roles.cache.has('944706938946609232'))
			return interaction.reply({
				content:
					'Tu doit avoir le rôle `Vraiment Cool` pour utiliser cette commande.',
				ephemeral: true
			})

		const getRandomColor = () => {
			const letters = '0123456789ABCDEF'
			let color = '#'
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)]
			}
			return color
		}

		if (onCooldown === true)
			return interaction.reply({
				content: 'La command est en cooldown.',
				ephemeral: true
			})

		const color = getRandomColor()
		const role = await interaction.guild.roles.cache.get('944706938946609232')

		await role.setColor(color).then(() => {
			onCooldown = true
			setTimeout(() => (onCooldown = false), 300000)
		})

		return await interaction.reply({
			content: `La couleur du rôle vraiment cool a été changée en ${color}.`
		})
	}
}
