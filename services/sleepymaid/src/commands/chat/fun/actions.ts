import { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	ApplicationCommandOptionData,
	resolveColor,
	ColorResolvable,
} from "discord.js";
// import { and, eq } from "drizzle-orm";
// import { actions } from "@sleepymaid/db";

const actionsObj: { [key: string]: { short: string; past: string; desc: string } } = {
	hug: {
		short: "hugs",
		past: "hugged",
		desc: "Give a hug to someone",
	},
	pat: {
		short: "pats",
		past: "patted",
		desc: "Pat someone on the back or head",
	},
	bite: {
		short: "bites",
		past: "bit",
		desc: "Bite someone playfully",
	},
	nom: {
		short: "noms",
		past: "nommed",
		desc: "Pretend to nibble on someone",
	},
	lick: {
		short: "licks",
		past: "licked",
		desc: "Lick someone playfully",
	},
	cuddle: {
		short: "cuddles",
		past: "cuddled",
		desc: "Cuddle up with someone",
	},
	eat: {
		short: "eats",
		past: "ate",
		desc: "Pretend to eat someone",
	},
	hello: {
		short: "greets",
		past: "greeted",
		desc: "Say hello to someone",
	},
	highfive: {
		short: "high-fives",
		past: "high-fived",
		desc: "Give someone a high-five",
	},
	kill: {
		short: "attacks",
		past: "killed",
		desc: "Pretend to kill someone",
	},
	kiss: {
		short: "kisses",
		past: "kissed",
		desc: "Kiss someone",
	},
	poke: {
		short: "pokes",
		past: "poked",
		desc: "Poke someone playfully",
	},
	pout: {
		short: "pouts at",
		past: "pouted at",
		desc: "Make a pouting face at someone",
	},
	punch: {
		short: "punches",
		past: "punched",
		desc: "Punch someone lightly",
	},
	shrug: {
		short: "shrugs at",
		past: "shrugged at",
		desc: "Shrug at someone",
	},
	sleep: {
		short: "sleeps near",
		past: "slept near",
		desc: "Sleep next to someone",
	},
	slap: {
		short: "slaps",
		past: "slapped",
		desc: "Slap someone playfully",
	},
	tickle: {
		short: "tickles",
		past: "tickled",
		desc: "Tickle someone",
	},
	wink: {
		short: "winks at",
		past: "winked at",
		desc: "Wink at someone",
	},
	dance: {
		short: "dances with",
		past: "danced with",
		desc: "Dance with someone",
	},
	wave: {
		short: "waves at",
		past: "waved at",
		desc: "Wave hello or goodbye to someone",
	},
	cheer: {
		short: "cheers for",
		past: "cheered for",
		desc: "Cheer someone up",
	},
	fistbump: {
		short: "fist-bumps",
		past: "fist-bumped",
		desc: "Give a fist bump to someone",
	},
	laugh: {
		short: "laughs with",
		past: "laughed with",
		desc: "Laugh with someone",
	},
	cry: {
		short: "cries with",
		past: "cried with",
		desc: "Cry with someone",
	},
};

export default class ActionsCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		const options: ApplicationCommandOptionData[] = [];

		for (const [k, v] of Object.entries(actionsObj)) {
			options.push({
				name: k,
				description: v?.desc ?? "No description available",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "user",
						description: "The user to get the action of",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
				],
			});
		}

		super(context, {
			data: {
				name: "actions",
				description: "Get a random action",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options,
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		const action = interaction.options.getSubcommand() as keyof typeof actionsObj;
		if (!action || typeof action !== "string") return;
		const user = interaction.options.getUser("user", true);
		const targetId = user.id;
		const actionData = actionsObj[action];
		if (!actionData) return;
		if (user.bot) {
			return interaction.reply({ content: "You can't do that with a bot.", ephemeral: true });
		}
		if (userId === targetId) {
			return interaction.reply({ content: "You can't do that with yourself.", ephemeral: true });
		}

		await interaction.deferReply();

		// const actionsData = await this.container.client.drizzle.query.actions.findFirst({
		// 	where: (actions, { eq }) => and(eq(actions.userId, userId), eq(actions.targetId, targetId)),
		// });

		// let count: number = 0;
		// if (actionsData) {
		// 	const _count = actionsData[action as keyof typeof actionsData] ?? 0;
		// 	if (typeof count !== "number") return interaction.editReply({ content: "An error occured." });
		// 	count = _count as number;
		// }

		// const number = count + 1;

		let color: ColorResolvable = "#01e6ff";
		if (interaction.member! && interaction.inCachedGuild()) {
			color = interaction.member!.displayHexColor;
		}

		await interaction.editReply({
			embeds: [
				{
					description: `**${interaction.user.displayName}** ${actionData.short} **${user.displayName}**`,
					// footer: {
					// 	text: `${interaction.user.displayName} has ${actionData.past} ${number} time${number === 1 ? "" : "s"}.`,
					// },
					color: resolveColor(color),
				},
			],
		});

		// if (!actionsData) {
		// 	await this.container.client.drizzle.insert(actions).values({
		// 		userId,
		// 		targetId,
		// 		[action]: number,
		// 	});
		// 	return;
		// }
		// await this.container.client.drizzle
		// 	.update(actions)
		// 	.set({ [action]: number })
		// 	.where(and(eq(actions.userId, userId), eq(actions.targetId, targetId)));

		return;
	}
}
