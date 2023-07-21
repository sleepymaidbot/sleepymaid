import type { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	PermissionFlagsBits,
} from 'discord-api-types/v10';
import {
	ChatInputCommandInteraction,
	MessageCreateOptions,
	MessageEditOptions,
	ChatInputApplicationCommandData,
	EmbedBuilder,
	resolveColor,
	ActionRowBuilder,
	ButtonBuilder,
} from 'discord.js';
import type { HelperClient } from '../../../lib/extensions/HelperClient';

interface MessagesType {
	[key: string]: MessageType;
}

interface MessageType {
	fancyName: string;
	function: (i: ChatInputCommandInteraction) => Promise<Array<MessageCreateOptions & MessageEditOptions>>;
}

const messages: MessagesType = {
	setupBienvenue: {
		fancyName: 'Bienvenue',
		function: async () => {
			// Message 1
			const embed1 = new EmbedBuilder()
				.setTitle(":otter: Bienvenue sur Le monde d'Ecorte")
				.setDescription('Ce serveur est un serveur entre amis qui vous permet de discuter et de vous divertir.')
				.setColor(resolveColor('#33a34b'));
			const embed2 = new EmbedBuilder()
				.setDescription(
					"Dans ce lieu, vous pourrez bénéficier d'un coin pour parler de tout et de rien ou poster vos meilleur mêmes sans vous prendre la tête même après une journée difficile!\n\n Pour commencer je te conseil de lire les règlements ci-dessous.\n<:blank:948461701420945439>",
				)
				.addFields([
					{
						name: '<:greenDot:948462338594467870> Liens utiles',
						value: '> **Discord:** https://discord.gg/8bpy2PC',
						inline: true,
					},
					{
						name: '<:greenDot:948462338594467870> Crédits',
						value: '> Les icônes utiliser sur le serveur sont la propriété de [Icons](https://discord.gg/9AtkECMX2P)',
						inline: true,
					},
				])
				.setColor(resolveColor('#36393f'));

			// Message 2

			const embed3 = new EmbedBuilder()
				.setTitle(':otter: Règlements du Serveur')
				.setDescription(
					'Pour garantir un environnement convivial et sécurisé, nous vous demandons de respecter les règlements ci-dessous sans exception.',
				)
				.setColor(resolveColor('#5765f2'));

			const embed4 = new EmbedBuilder()
				.addFields([
					{
						name: '<:blueDot:948466553505062992> A. Bon sens',
						value:
							'```01. Vous devez respecter les ToS de Discord\n02. Pas de NSFW, politiques ou pub\n03. Le spam ou troll est interdit\n04. Gardez vos drama personnel en MP\n05. Gardez un profil approprié\n06. Traitez les autres avec respect```',
					},
					{
						name: '<:blueDot:948466553505062992> B. Utilisation du serveur',
						value:
							"```07. Ne demandez pas de rôles, points, etc.\n08. Respectez le sujet de chaque salon\n09. Utiliser ModMail pour parler au staff\n10. Ne donnez pas d'informations personnelles\n11. Ne mentionnez pas sans raison```",
					},
					{
						name: '<:blueDot:948466553505062992> C. Événements',
						value:
							"```12. Respectez les autres participants\n13. Voler le travail d'autrui est interdit\n14. Lisez bien les instructions d'un évènement avant d'y participer```",
					},
				])
				.setFooter({
					text: 'Cette liste ne contient pas tout ce que vous pouvez / ne pouvez pas faire. Les membres du staff peuvent appliquer les règles de la manière qui leur convient le mieux.',
				})
				.setColor(resolveColor('#36393f'));

			// Message 3
			const embed5 = new EmbedBuilder()
				.setTitle(':otter: Rôles & Notifications')
				.setColor(resolveColor('#ff9326'))
				.setDescription(
					'Sélectionnez les rôles et notifications qui vous intéressent sur le serveur en cliquant sur les boutons ci-dessous. Si besoin, cliquez sur le bouton **Voir mes Rôles** pour voir la liste de vos rôles.',
				);

			const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder()
					.setCustomId('lmeMeta:bienvenue:init:ping')
					.setLabel('Notifications')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('lmeMeta:bienvenue:init:color')
					.setLabel('Couleur')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('lmeMeta:bienvenue:init:viewRoles')
					.setLabel('Voir mes rôles')
					.setEmoji({ name: '❔' })
					.setStyle(ButtonStyle.Secondary),
			]);

			// Message 4
			const embed6 = new EmbedBuilder()
				.setTitle(':otter: Accès au serveur')
				.setColor(resolveColor('#3ba55d'))
				.setDescription('Pour avoir accès au serveur, cliquez sur le bouton ci-dessous.');

			const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder()
					.setCustomId('lmeMeta:bienvenue:join')
					.setLabel("J'ai lu et j'accepte les règlements")
					.setStyle(ButtonStyle.Success)
					.setEmoji({ name: '✅' }),
			]);

			const r = [
				{
					embeds: [embed1, embed2],
				},
				{
					content: '<:blank:948461701420945439>',
					embeds: [embed3, embed4],
				},
				{
					content: '<:blank:948461701420945439>',
					embeds: [embed5],
					components: [row1],
				},
				{
					content: '<:blank:948461701420945439>',
					embeds: [embed6],
					components: [row2],
				},
			];

			return r;
		},
	},
};

const getChoices = () => {
	const choices = [];
	for (const [k, v] of Object.entries(messages)) {
		choices.push({
			name: v.fancyName,
			value: k,
		});
	}
	return choices;
};

export default class LmeSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['324284116021542922'];
	public readonly data = {
		name: 'lmesetup',
		description: '[Admin only] Allow you to post pre-made messages.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'name',
				description: 'The name of the command',
				type: ApplicationCommandOptionType.String,
				choices: getChoices(),
				required: true,
			},
			{
				name: 'message_id',
				description: 'The id of the message you want to edit',
				type: ApplicationCommandOptionType.String,
				required: false,
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: HelperClient) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return;
		const name = interaction.options.getString('name');
		if (!name) return;
		const msg = messages[name];
		if (!msg) return;
		const messageId = interaction.options.getString('message_id');
		if (messageId) {
			const message = await interaction.channel?.messages.fetch(messageId);
			if (!message) {
				await interaction.reply({
					embeds: [
						{
							color: 3553599,
							description: '<:redX:948606748334358559> Message not found.',
						},
					],
					ephemeral: true,
				});
			}
			if (message?.author.id !== client.user?.id) {
				await interaction.reply({
					embeds: [
						{
							color: 3553599,
							description: '<:redX:948606748334358559> You can only edit messages sent by the bot.',
						},
					],
					ephemeral: true,
				});
			} else {
				const msgs = await msg.function(interaction);
				if (msgs.length === 1) await message?.edit((await msgs[0]) as MessageEditOptions);
				else
					await interaction.reply({
						embeds: [
							{
								color: 3553599,
								description: '<:redX:948606748334358559> Message too big.',
							},
						],
						ephemeral: true,
					});
			}
		} else {
			await msg.function(interaction).then((msgs) =>
				msgs.forEach(async (msg) => {
					await interaction?.channel?.send({ ...msg, allowedMentions: { parse: [] } });
				}),
			);
		}
		await interaction.reply({
			embeds: [
				{
					color: 3553599,
					description: '<:greenTick:948620600144982026> Done!',
				},
			],
			ephemeral: true,
		});
	}
}
