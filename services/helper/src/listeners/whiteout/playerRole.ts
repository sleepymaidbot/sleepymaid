import type { ListenerInterface } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";

export default class PlayerRoleSyncerListener implements ListenerInterface {
  public readonly name = "guildMemberUpdate";
  public readonly once = false;

  public async execute(
    oldMember: GuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    if (newMember.guild.id !== "1150379660128047104") return;
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

    const playerRole = newMember.guild.roles.cache.get("1158519484852748409");
    if (!playerRole) return;
    if (newMember.roles.cache.has(playerRole.id)) {
      let isTeamMember = false;
      newMember.roles.cache.forEach((role) => {
        if (role.name.startsWith("3s Whiteout") && role.name.endsWith("Player"))
          isTeamMember = true;
        else if (
          role.name.startsWith("2s Whiteout") &&
          role.name.endsWith("Player")
        )
          isTeamMember = true;
      });
      if (!isTeamMember) await newMember.roles.remove(playerRole);
    } else {
      let isTeamMember = false;
      newMember.roles.cache.forEach((role) => {
        if (role.name.startsWith("3s Whiteout") && role.name.endsWith("Player"))
          isTeamMember = true;
        else if (
          role.name.startsWith("2s Whiteout") &&
          role.name.endsWith("Player")
        )
          isTeamMember = true;
      });
      if (isTeamMember) await newMember.roles.add(playerRole);
    }
  }
}
