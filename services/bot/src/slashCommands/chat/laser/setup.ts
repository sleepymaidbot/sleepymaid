import {
	ActionRowBuilder,
	UnsafeEmbedBuilder,
	ButtonBuilder
} from '@discordjs/builders'
import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	PermissionFlagsBits,
	ComponentType
} from 'discord-api-types/v10'
import {
	ChatInputCommandInteraction,
	MessageOptions,
	MessageEditOptions,
	APIEmbedAuthor
} from 'discord.js'
import { BotClient } from '../../../lib/extensions/BotClient'

interface MessagesType {
	[key: string]: MessageType
}

interface MessageType {
	fancyName: string
	function: (
		i: ChatInputCommandInteraction
	) => Promise<MessageOptions & MessageEditOptions>
}

const author: APIEmbedAuthor = {
	name: 'Casino Secret Steps',
	url: 'https://discord.gg/FZQtwR3MeV',
	icon_url:
		'https://media.discordapp.net/attachments/451488182572417025/979200894467985408/fd75504bd8a4810f750bdb5a94ade84c.png'
}

const messages: MessagesType = {
	'self-roles-setup': {
		fancyName: 'Self-Roles Setup',
		function: async () => {
			const row = new ActionRowBuilder<ButtonBuilder>({
				components: [
					{
						type: ComponentType.Button,
						label: 'Manage my roles',
						style: ButtonStyle.Success,
						custom_id: 'laser-role-ping:manage',
						emoji: {
							id: '975870168251113545'
						}
					},
					{
						type: ComponentType.Button,
						label: 'Remove all my roles',
						style: ButtonStyle.Danger,
						custom_id: 'laser-role-ping:removeall',
						emoji: {
							id: '948606748334358559'
						}
					}
				]
			})

			const embed = new UnsafeEmbedBuilder({
				title: 'Self-assignable roles',
				description: 'With this message you can assign yourself some roles.',
				fields: [
					{
						name: 'Why ?',
						value:
							'Those roles are use to only get pings when we are doing a specific map secret on a specific server.',
						inline: true
					},
					{
						name: 'How ?',
						value:
							"Click the button 'Manage my roles' to select the servers you are willing to complete map secrets on! \n Click the button 'Remove all my roles' to remove all your roles.",
						inline: true
					}
				]
			})

			return {
				embeds: [embed],
				components: [row]
			}
		}
	},
	'casinostep1': {
		fancyName: 'Casino Step 1 - Blockers',
		function: async () => {
			const embed = new UnsafeEmbedBuilder({
				title: 'Step 1 - Blockers',
				description:
					'Firstly, you need to shoot the [main power box](https://canary.discord.com/channels/860721584373497887/980671199510151208/980671239473483826) to start the sparks. \nAt the 3 or 4 spark you need to activate the [2 buttons](https://canary.discord.com/channels/860721584373497887/980671199510151208/983536491764514846) then you have to shoot the blockers right after the last spark before that blocker.',
				color: 3553599,
				fields: [
					{
						name: 'Bonus time',
						value:
							'This steps gives a ``60`` seconds time bonus when completed.'
					},
					{
						name: 'Video Clip',
						value:
							'Click [here](https://medal.tv/games/garrys-mod/clips/nOmwUbsAgsjhv/gs544iOcSp4q) to get a video of us doing it.'
					},
					{
						name: 'Credits',
						value:
							'<@420662095869378560> - For being the first one to break a blocker.\n<@302793054962581505> - For helping find the good timing and being the first one the destroy all the blockers.'
					}
				],
				author
			})

			return {
				embeds: [embed]
			}
		}
	},
	'casinostep2': {
		fancyName: 'Casino Step 2 - Keypad',
		function: async () => {
			const embed = new UnsafeEmbedBuilder({
				title: 'Step 2 - Main door key card',
				description:
					'To get the key card you need to stab the poster in security room.\nThen shoot the [blue part](https://canary.discord.com/channels/860721584373497887/980940688168480839/980953643622740059) of the keypad with a gun.\nYou will get a key card.\nThis key card can be used in the [key card reader at the main door](https://canary.discord.com/channels/860721584373497887/980940688168480839/980940988208013392) once the first step is done.',
				color: 3553599,
				fields: [
					{
						name: 'Video Clip',
						value:
							'Click [here](https://medal.tv/games/garrys-mod/clips/nAp2b42Xg7ysq/d1337jx9lQuX) to get a video of us doing it.'
					},
					{
						name: 'Credits',
						value: '<@285502356811022336> - For finding how to open the keypad.'
					}
				],
				author
			})

			return {
				embeds: [embed]
			}
		}
	},
	'casinostep3': {
		fancyName: 'Casino Step 3 - Hammer',
		function: async () => {
			const embed = new UnsafeEmbedBuilder({
				title: 'Step 3 - Hammer',
				color: 3553599,
				description:
					'To get the hammer you need to bring to [box](https://canary.discord.com/channels/860721584373497887/986336932109881374/986337044089430086) outside to the [lasers](https://canary.discord.com/channels/860721584373497887/986336932109881374/986337155678896189). Then activate the lasers. This will burn the box and give the hammer that can be used to open the [blocked door](https://canary.discord.com/channels/860721584373497887/986336932109881374/986337214311063572).',
				fields: [
					{
						name: 'Video Clip',
						value:
							'Click [here](https://medal.tv/games/garrys-mod/clips/opgyilfYXydqy/d1337LULzVYw) to get a video of us doing it.'
					},
					{
						name: 'Credits',
						value:
							'<@562779372533186560> - For having the idea of burning the box.'
					}
				],
				author
			})

			return { embeds: [embed] }
		}
	}
}

const getChoices = () => {
	const choices = []
	for (const [k, v] of Object.entries(messages)) {
		choices.push({
			name: v.fancyName,
			value: k
		})
	}
	return choices
}

export default new SlashCommand(
	{
		guildIds: ['860721584373497887'],
		data: {
			name: 'setup',
			description: '[Admin only] Allow you to post pre-made messages.',
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: 'name',
					description: 'The name of the command',
					type: ApplicationCommandOptionType.String,
					choices: getChoices(),
					required: true
				},
				{
					name: 'message_id',
					description: 'The id of the message you want to edit',
					type: ApplicationCommandOptionType.String,
					required: false
				}
			]
		}
	},
	{
		async run(interaction: ChatInputCommandInteraction, client: BotClient) {
			if (!interaction.inCachedGuild()) return
			if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator))
				return
			const name = interaction.options.getString('name')
			const msg = messages[name]
			if (!msg) return
			const messageId = interaction.options.getString('message_id')
			if (messageId) {
				const message = await interaction.channel.messages.fetch(messageId)
				if (!message) {
					await interaction.reply({
						embeds: [
							{
								color: 3553599,
								description: '<:redX:948606748334358559> Message not found.'
							}
						],
						ephemeral: true
					})
				}
				if (message.author.id !== client.user.id) {
					await interaction.reply({
						embeds: [
							{
								color: 3553599,
								description:
									'<:redX:948606748334358559> You can only edit messages sent by the bot.'
							}
						],
						ephemeral: true
					})
				} else {
					await message.edit(await msg.function(interaction))
				}
			} else {
				await interaction.channel.send(await msg.function(interaction))
			}
			await interaction.reply({
				embeds: [
					{
						color: 3553599,
						description: '<:greenTick:948620600144982026> Done!'
					}
				],
				ephemeral: true
			})
		}
	}
)
