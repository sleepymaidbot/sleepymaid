import { Context, Listener } from "@sleepymaid/handler";
import { AuditLogEvent, VoiceState } from "discord.js";
import { HelperClient } from "../../lib/extensions/HelperClient";

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
		if (oldState.member.id !== "523915165545136141") return;
		if (oldState.channel !== null && newState.channel == null) {
			const auditLog = await oldState.guild.fetchAuditLogs({ type: AuditLogEvent.MemberDisconnect });
			const entry = auditLog.entries.filter((entry) => Date.now() - entry.createdTimestamp < 10_000).first();
			if (!entry) return;

			const oldNickname = oldState.member.nickname;

			const currentNumber = oldNickname?.match(/^\[(\d+)\]/)
				? parseInt(oldNickname.match(/^\[(\d+)\]/)?.[1] ?? "0")
				: 0;

			const newNumber = currentNumber + 1;
			const restOfNickname = oldNickname?.replace(/^\[\d+\]\s*/, "") ?? oldState.member.user.username;
			const newNickname = `[${newNumber}] ${restOfNickname}`;

			await oldState.member.setNickname(newNickname);
		}
	}
}
