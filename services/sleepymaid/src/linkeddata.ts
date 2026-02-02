import { REST } from "@discordjs/rest"
import { ApplicationRoleConnectionMetadata } from "discord.js"
import { Routes } from "discord-api-types/v10"

;(async () => {
	const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!)

	console.log("Updating metadata...")

	const metaData: ApplicationRoleConnectionMetadata[] = [
		{
			type: 2,
			key: "coins",
			name: "Coins",
			description: "The number of coins you have",
			nameLocalizations: {
				"en-US": "Coins",
				fr: "Pièces",
			},
			descriptionLocalizations: {
				"en-US": "The number of coins you have",
				fr: "Le nombre de pièces que vous avez",
			},
		},
	]

	const data = await rest
		.put(Routes.applicationRoleConnectionMetadata(process.env.DISCORD_CLIENT_ID!), {
			body: metaData,
		})
		.catch((err) => {
			console.error(err)
		})

	console.log(data)
	console.log("Done!")
})()
