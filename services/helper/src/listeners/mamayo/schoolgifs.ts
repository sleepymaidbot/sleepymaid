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

const GIF_REGEX = /(https?:\/\/)?(tenor\.com|giphy\.com|media\.tenor\.com|.*\.gif)/i

const users: Record<string, number> = {}

const channelsWhitelist = new Set([
	"1304165003628380230", // Mods (testing)
	"1150816464853541025", // School stuff
	"1303913563802566656", // General
])

const roleWhitelist = new Set([
	"1301593179216412842", // Mod
	"1293983018104656023", // Admin
	"1305968449100451961", // Responsable
	"1150822312199852102", // Booster
])

const GUILD_ID = "1150780245151068332"
const minutes = 1

const userCurrencyCache = new Map<string, { currency: number; timestamp: number }>()
const CACHE_TTL = 60_000

export default class extends Listener<"messageCreate", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (!message.guild || message.guild.id !== GUILD_ID) return
		if (!channelsWhitelist.has(message.channel.id)) return
		if (!message.channel.isSendable()) return

		const member = message.member
		if (!member) return

		if (member.roles.cache.some((role) => roleWhitelist.has(role.id))) return

		if (!GIF_REGEX.test(message.content)) return

		const userId = message.author.id
		const now = Date.now()
		let userMinutes = minutes

		if (member.presence?.status === "offline") userMinutes = 30

		const userCooldown = users[userId]
		if (userCooldown && now <= userCooldown) {
			await message.delete().catch(() => null)
			const expiryMs = userCooldown
			const timeLeft = Math.floor(expiryMs / 1000)
			const minutesLeft = Math.ceil((expiryMs - now) / (60 * 1000))

			const messageContent: MessageCreateOptions = {
				content: `<@${userId}> Merci d'attendre ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} avant d'envoyer un autre gif.\nVous pouvez envoyer un autre gif <t:${timeLeft}:R>.\nSi vous voulez envoyer des gifs, c'est <#1150785784119566406>.`,
			}

			const cached = userCurrencyCache.get(userId)
			let userCurrency: number | undefined = cached?.currency

			if (!cached || now - cached.timestamp > CACHE_TTL) {
				const userProfile = await this.container.client.drizzle.query.userData.findFirst({
					where: eq(userData.userId, userId),
				})
				userCurrency = userProfile?.currency ?? 0
				userCurrencyCache.set(userId, { currency: userCurrency, timestamp: now })
			}

			if (userCurrency !== undefined && userCurrency >= 10_000) {
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
			const warning = await message.channel.send(messageContent).catch(() => null)
			if (!warning) return

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
				userCurrencyCache.delete(userId)
				await i.editReply({
					content: `<@${userId}> Cooldown réinitialisé. Vous pouvez envoyer un autre gif maintenant.`,
				})
				await collector.stop()
				await warning.delete().catch(() => null)
				return
			})
			setTimeout(() => {
				warning.delete().catch(() => null)
				collector.stop()
			}, 15_000)
		} else {
			users[userId] = add(now, { minutes: userMinutes }).getTime()
		}
	}
}
