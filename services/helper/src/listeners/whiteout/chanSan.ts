import type { ListenerInterface } from "@sleepymaid/handler";
import sanitize from "@aero/sanitizer";
import { GuildChannel } from "discord.js";

export default class WelcomeListener implements ListenerInterface {
  public readonly name = "channelUpdate";
  public readonly once = true;

  public async execute(oldChannel: GuildChannel, newChannel: GuildChannel) {
    if (oldChannel.guild.id !== "1150379660128047104") return;
    const sanitized = sanitize(newChannel.name);
    if (newChannel.name !== sanitized)
      await newChannel.setName(sanitized, "Sanitizer");
  }
}
