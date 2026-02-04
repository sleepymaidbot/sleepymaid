import { Context, Listener } from "@sleepymaid/handler"
import { add } from "date-fns"
import {
	ButtonStyle,
	ComponentType,
	MessageComponentInteraction,
	MessageFlags,
	type Message,
	type MessageCreateOptions,
} from "discord.js"
import { HelperClient } from "../../lib/extensions/HelperClient"
import { eq, sql } from "drizzle-orm"
import { userData } from "@sleepymaid/db"

const gifsDomains = ["https://tenor.com", "https://giphy.com", "https://media.tenor.com"]

const users: Record<string, number> = {}

const channelsWhitelist = [
	"1304165003628380230", // Mods (testing)
	"1150816464853541025", // School stuff
	"1303913563802566656", // General
]

const roleWhitelist = [
	"1301593179216412842", // Mod
	"1293983018104656023", // Admin
	"1305968449100451961", // Responsable
	"1150822312199852102", // Booster
]

const minutes = 1

export default class extends Listener<"messageCreate", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (!message.guild) return
		if (message.guild.id !== "1150780245151068332") return
		if (!channelsWhitelist.includes(message.channel.id)) return
		if (roleWhitelist.some((role) => message.member?.roles.cache.has(role))) return

		const msg = message.content.split(" ")

		let hasGifLink = false

		for (const word of msg) {
			if (gifsDomains.some((domain) => word.includes(domain))) {
				hasGifLink = true
				break
			} else if (word.includes("https://") && word.includes(".gif")) {
				hasGifLink = true
				break
			} else if (word.includes("http://") && word.includes(".gif")) {
				hasGifLink = true
				break
			}
		}

		if (!hasGifLink) return
		if (!message.channel.isSendable()) return

		const member = message.member
		if (!member) return
		const userId = message.author.id

		let userMinutes = minutes

		if (member.presence?.status === "offline") userMinutes = 30

		if (users[userId]) {
			if (Date.now() > users[userId]) {
				users[userId] = add(Date.now(), { minutes: userMinutes }).getTime()
			} else {
				message.delete()
				const expiryMs = users[userId]
				const timeLeft = Math.floor(expiryMs / 1000)
				const minutesLeft = Math.ceil((expiryMs - Date.now()) / (60 * 1000))

				const messageContent: MessageCreateOptions = {
					content: `<@${userId}> Merci d'attendre ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} avant d'envoyer un autre gif.\nVous pouvez envoyer un autre gif <t:${timeLeft}:R>.\nSi vous voulez envoyer des gifs, c'est <#1150785784119566406>.`,
				}
				const userProfile = await this.container.client.drizzle.query.userData.findFirst({
					where: eq(userData.userId, userId),
				})
				if (userProfile && userProfile.currency >= 10_000) {
					messageContent.content += `\n\nSi vous voulez envoyer un gif maintenant, vous pouvez réinitialiser votre cooldown en payant 10000 coins <@613040835684073506>.`
					messageContent.components = [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.Button,
									style: ButtonStyle.Success,
									label: "Payer pour réinitialiser le cooldown",
									customId: `reset-cooldown-${userId}`,
									emoji: { name: "💸" },
								},
							],
						},
					]
				}
				const warning = await message.channel.send(messageContent)
				const collector = warning.createMessageComponentCollector({
					filter: (i: MessageComponentInteraction) => i.customId === `reset-cooldown-${userId}`,
					time: 15_000,
				})

				collector.on("collect", async (i: MessageComponentInteraction) => {
					if (i.user.id !== userId) return await i.deferUpdate()
					await i.deferReply({ flags: MessageFlags.Ephemeral })

					const userProfile = await this.container.client.drizzle.query.userData.findFirst({
						where: eq(userData.userId, userId),
					})
					if (!userProfile) return await i.editReply({ content: "Something went wrong." })
					if (userProfile.currency < 10000) return await i.editReply({ content: "You don't have enough coins." })

					await this.container.client.drizzle
						.update(userData)
						.set({
							currency: sql`${userData.currency} - 10000`,
						})
						.where(eq(userData.userId, userId))

					users[userId] = 0
					await i.editReply({
						content: `<@${userId}> Cooldown réinitialisé. Vous pouvez envoyer un autre gif maintenant.`,
					})
					await collector.stop()
					await warning.delete()
					return
				})
				setTimeout(() => {
					warning.delete()
					collector.stop()
				}, 15_000)
			}
		} else {
			users[userId] = add(Date.now(), { minutes: userMinutes }).getTime()
		}
	}
}
