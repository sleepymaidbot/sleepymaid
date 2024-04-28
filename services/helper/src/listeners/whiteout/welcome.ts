import type { ListenerInterface } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";

export default class WelcomeListener implements ListenerInterface {
  public readonly name = "guildMemberAdd";
  public readonly once = false;

  public async execute(member: GuildMember) {
    if (member.guild.id !== "1150379660128047104") return;
    if (member.user.bot) return;
    const role = member.guild.roles.cache.get("1150541368498856017");
    if (!role) return;
    await member.roles.add(role, "Auto-role");
  }
}
