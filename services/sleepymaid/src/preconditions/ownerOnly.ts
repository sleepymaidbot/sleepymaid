import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { Context, Precondition, type CommandInteractionTypeUnion } from "@sleepymaid/handler";

export default class OwnerOnlyPrecondtion extends Precondition<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context);
	}

	public override async CommandRun(interaction: CommandInteractionTypeUnion) {
		const owners = ["324281236728053760"];
		if (!owners.includes(interaction.user.id)) {
			await interaction.reply({
				content: "You are not the owner of this bot",
				ephemeral: true,
			});
			return false;
		}
		return true;
	}
}
