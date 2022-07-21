import { SlashCommandInterface } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	PermissionFlagsBits,
	ComponentType,
	APIActionRowComponent,
	APIEmbedAuthor,
	APIButtonComponent,
	APIEmbed
} from 'discord-api-types/v10'
import {
	ChatInputCommandInteraction,
	MessageOptions,
	MessageEditOptions,
	ChatInputApplicationCommandData
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
			const row: APIActionRowComponent<APIButtonComponent> = {
				type: 1,
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
			}

			const embed: APIEmbed = {
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
			}

			return {
				embeds: [embed],
				components: [row]
			}
		}
	},
	'casinostep1': {
		fancyName: 'Casino Step 1 - Blockers',
		function: async () => {
			const embed: APIEmbed = {
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
			}

			return {
				embeds: [embed]
			}
		}
	},
	'casinostep2': {
		fancyName: 'Casino Step 2 - Keypad',
		function: async () => {
			const embed: APIEmbed = {
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
			}

			return {
				embeds: [embed]
			}
		}
	},
	'casinostep3': {
		fancyName: 'Casino Step 3 - Hammer',
		function: async () => {
			const embed: APIEmbed = {
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
			}

			return { embeds: [embed] }
		}
	},
	'casinostep4': {
		fancyName: 'Casino Step 4 - Control room lasers',
		function: async () => {
			const embed: APIEmbed = {
				title: 'Step 4 - Control room lasers',
				color: 3553599,
				description:
					'You first need to get the order of which the [control room lasers](https://discord.com/channels/860721584373497887/980682918793973760/999748075016953856) and the [middle lasers](https://canary.discord.com/channels/860721584373497887/980682918793973760/999749530532708473) are shaking. To do that you need to first activate the [middle laser](https://canary.discord.com/channels/860721584373497887/980682918793973760/999749530532708473) and then shoot on the [power box](https://discord.com/channels/860721584373497887/980682918793973760/999747692311883898) in the control room which will make all lasers shake in an order.\n :information_source: **Info:** Middle lasers might be split in 2. \n\nThe code from the control room represents the order and the code from the middle lasers the code itself. \n:information_source: **Example:** Middle code: `1342` and control room code: `2431` the first number from the middle code is `1` and from the control room code `2` so that means that the number one will be the second button the activate. The order for the buttons would be `2143`. \nThen you need to shoot knifes, axes or props on the buttons (<#980682918793973760>).',
				fields: [
					{
						name: 'Slash command',
						value:
							'We made a slash that takes as input order from the control room and the middle lasers and outputs the button order. The command is `/casino getbuttonorder <control room code> <middle lasers code>`.'
					},
					{
						name: 'Credits',
						value: '<@285502356811022336> - For finding how to decode the code.'
					}
				],
				author
			}
			return { embeds: [embed] } //
		}
	},
	'casinostep5': {
		fancyName: 'Casino Step 5 - Simon Says',
		function: async () => {
			const embed: APIEmbed = {
				title: 'Step 5 - Simon Says',
				color: 3553599,
				description:
					'Firstly, you need to bring back the key card from step 2.\nThen someone will go and be at the security room watching cams.\nThen you need to slide the key card in the [key card reader in the control room](https://discord.com/channels/860721584373497887/980940688168480839/982099937087078511). \n\nThree color will appear on a screen that you are able to see from the third floor cam you will need to remember them. \nAt the same time, the third floor cam will be available in security room. The button to view the third floor cam changes after every sequence of color. It will put you on a random cam and the button will be randomised again. An order will be shown on a screen. \n\nYou then need to input that order in control room. You need to do this ``6`` times adding one color to the order every time.',
				fields: [
					{
						name: 'Bonus time',
						value:
							'This steps gives a ``120`` seconds time bonus when completed.'
					},
					{
						name: 'Video Clip',
						value:
							'Click [here](https://medal.tv/games/garrys-mod/clips/oOCAEKxMGwoDR/d1337CBNS5hA) to get a video of us doing it.'
					},
					{
						name: 'Credits',
						value:
							'<@217473615174565888> - For being the first one the finish simon says.'
					}
				],
				author
			}
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

export default class LaserSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['860721584373497887']
	public readonly data = {
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
	} as ChatInputApplicationCommandData

	public async execute(
		interaction: ChatInputCommandInteraction,
		client: BotClient
	) {
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
