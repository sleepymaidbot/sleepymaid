import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Message } from "discord.js";
import { add } from "date-fns";

const gifsDomains = ["https://tenor.com", "https://giphy.com", "https://media.tenor.com"];

const users: Record<string, number> = {};

const channelsWhitelist = [
	"1304165003628380230", // Mods (testing)
	"1150816464853541025", // School stuff
	"1303913563802566656", // General
];

const roleWhitelist = [
	"1301593179216412842", // Mod
	"1293983018104656023", // Admin
	"1305968449100451961", // Responsable
];

export default class extends Listener<"messageCreate", SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (!message.guild) return;
		if (message.guild.id !== "1150780245151068332") return;
		if (!channelsWhitelist.includes(message.channel.id)) return;
		if (roleWhitelist.some((role) => message.member?.roles.cache.has(role))) return;

		const msg = message.content.split(" ");

		let hasGifLink = false;

		for (const word of msg) {
			if (gifsDomains.some((domain) => word.includes(domain))) {
				hasGifLink = true;
				break;
			} else if (word.includes("https://") && word.includes(".gif")) {
				hasGifLink = true;
				break;
			} else if (word.includes("http://") && word.includes(".gif")) {
				hasGifLink = true;
				break;
			}
		}

		if (!hasGifLink) return;
		if (!message.channel.isSendable()) return;

		const userId = message.author.id;

		if (users[userId]) {
			if (Date.now() > users[userId]) {
				users[userId] = add(Date.now(), { minutes: 3 }).getTime();
			} else {
				message.delete();
				const warning = await message.channel.send(
					`<@${userId}> Merci d'attendre 3 minutes avant d'envoyer un autre gif. Si vous voulez envoyez des gifs, c'est <#1300509988917350471>.`,
				);
				setTimeout(() => {
					warning.delete();
				}, 10_000);
			}
		} else {
			users[userId] = add(Date.now(), { minutes: 3 }).getTime();
		}
	}
}
