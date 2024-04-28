import { opendir } from "node:fs/promises";
import type { TaskInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../lib/extensions/HelperClient";
import { Channel, ChannelType, ForumChannel } from "discord.js";
import { join } from "node:path";

function isForumChannel(channel: Channel): channel is ForumChannel {
  return channel.type == ChannelType.GuildForum;
}

export default class BannerTask implements TaskInterface {
  public readonly interval = "0 * * * *";
  // @ts-ignore
  public async execute(client: HelperClient) {
    if (client.config.nodeEnv === "dev") return;
    const guild = client.guilds.cache.get("324284116021542922");
    if (!guild?.premiumSubscriptionCount) return;
    if (guild.premiumSubscriptionCount < 7) return;
    client.logger.debug("Banner task started");
    try {
      const dir = await opendir(join(__dirname, "../../banners"));
      const banners = [];
      for await (const dirent of dir) {
        if (dirent.name.endsWith(".png")) banners.push(dirent.name);
      }

      const banner = banners[Math.floor(Math.random() * banners.length)];

      guild
        ?.setBanner(
          join(__dirname, `../../banners/${banner}`),
          `Changed banner to ${banner}`,
        )
        .catch(client.logger.error);

      const channel = guild?.channels.cache.get("1024444544407834675");
      if (!channel || !isForumChannel(channel)) return;
      const thread = await channel.threads.fetch("1026359286093336606");
      if (!thread) return;
      thread.send(`**Banner Rotation**\nBanner is now \`\`${banner}\`\``);
    } catch (err) {
      client.logger.error(err as Error);
    }
  }
}
