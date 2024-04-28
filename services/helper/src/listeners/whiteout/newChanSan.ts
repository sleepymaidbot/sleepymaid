import type { ListenerInterface } from "@sleepymaid/handler";
import sanitize from "@aero/sanitizer";
import { GuildChannel } from "discord.js";

export default class WelcomeListener implements ListenerInterface {
  public readonly name = "channelCreate";
  public readonly once = true;

  public async execute(channel: GuildChannel) {
    if (channel.guild.id !== "1150379660128047104") return;
    const sanitized = sanitize(channel.name);
    if (channel.name !== sanitized)
      await channel.setName(sanitized, "Sanitizer");
  }
}
