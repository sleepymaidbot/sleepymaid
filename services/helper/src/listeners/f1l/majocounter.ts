import { Context, Listener } from "@sleepymaid/handler";
import { AuditLogEvent, VoiceState } from "discord.js";
import { HelperClient } from "../../lib/extensions/HelperClient";
import { sql } from "drizzle-orm";
import { disconnectCounter } from "@sleepymaid/db";

export default class extends Listener<"voiceStateUpdate", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "voiceStateUpdate",
			once: false,
		});
	}

	public override async execute(oldState: VoiceState, newState: VoiceState) {
		if (oldState.guild.id !== "796534493535928320") return;
		if (!oldState.member) return;
		// if (oldState.member.id !== "523915165545136141") return;
		if (!oldState.guild.members.me?.permissions.has("ManageNicknames")) return;
		if (!oldState.member.manageable) return;
		if (oldState.member.user.bot) return;
		if (oldState.channel !== null && newState.channel == null) {
			const auditLog = await oldState.guild.fetchAuditLogs({ type: AuditLogEvent.MemberDisconnect });
			const entry = auditLog.entries.filter((entry) => Date.now() - entry.createdTimestamp < 30_000).first();
			if (!entry) return;
			const user = await this.container.client.drizzle
				.insert(disconnectCounter)
				.values({
					userId: oldState.member.id,
					count: 1,
				})
				.onConflictDoUpdate({
					target: [disconnectCounter.userId],
					set: {
						count: sql`${disconnectCounter.count} + 1`,
					},
				})
				.returning({
					count: disconnectCounter.count,
				});
			if (!user || !user[0]) return;

			const newNickname = `[${user[0].count}] ${oldState.member.nickname ?? oldState.member.user.displayName}`;

			await oldState.member.setNickname(newNickname);
		}
	}
}
