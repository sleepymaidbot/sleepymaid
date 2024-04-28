import type { TaskInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../lib/extensions/HelperClient";
import { Snowflake } from "discord.js";

const channels: Snowflake[] = ["1161443606339522580"];

export default class BannerTask implements TaskInterface {
  public readonly interval = "0 3 * * *";
  // @ts-ignore
  public async execute(client: HelperClient) {
    client.logger.debug("Lfg delete task started");
    for (const channelId of channels) {
      const channel = client.channels.cache.get(channelId);
      if (!channel) continue;
      if (!channel.isTextBased()) continue;
      const messages = await channel.messages.fetch({ limit: 100 });
      for (const message of messages.values()) {
        if (message.createdTimestamp < Date.now() - 600000) {
          if (message.pinned) continue;
          await message.delete();
        } else continue;
      }
    }
  }
}
