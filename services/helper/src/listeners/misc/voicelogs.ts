import {
  ForumChannel,
  GuildBasedChannel,
  resolveColor,
  VoiceState,
} from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import type { ListenerInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../../lib/extensions/HelperClient";
import { ChannelType } from "discord-api-types/v10";

const month: { [key: number]: string } = {
  0: "Janvier",
  1: "Février",
  2: "Mars",
  3: "Avril",
  4: "Mai",
  5: "Juin",
  6: "Juillet",
  7: "Août",
  8: "Septembre",
  9: "Octobre",
  10: "Novembre",
  11: "Décembre",
};

function returnCurentTime() {
  const d = new Date();
  let min = d.getMinutes().toString();
  if (d.getMinutes() <= 9) min = "0" + min;
  return `${month[d.getMonth()]} ${d.getDate()} ${d.getHours()}:${min} ${d.getFullYear()}`;
}

function isForumChannel(channel: GuildBasedChannel): channel is ForumChannel {
  return channel.type === ChannelType.GuildForum;
}

export default class VoiceLogListener implements ListenerInterface {
  public readonly name = "voiceStateUpdate";
  public readonly once = false;

  async execute(
    oldState: VoiceState,
    newState: VoiceState,
    client: HelperClient,
  ) {
    if (newState.guild.id !== "324284116021542922") return;
    //if (client.config.nodeEnv === 'dev') return;
    const channel = newState.guild?.channels.cache.get("1024444544407834675");
    if (!channel || !isForumChannel(channel)) return;
    const thread = await channel.threads.fetch("1026359329890254919");
    if (!thread) return;
    // Join
    if (oldState.channel == null && newState.channel != null) {
      const embed = new EmbedBuilder()
        .setTitle("Presence Update")
        .setDescription(
          `**${newState?.member?.user.tag}** has joined **${newState.channel.name}**.`,
        )
        .setColor(resolveColor("#409400"))
        .setFooter({ text: returnCurentTime() });

      try {
        await thread.send({ embeds: [embed] });
      } catch (e) {
        client.logger.error(e as Error);
      }
    }
    // Leave
    else if (oldState.channel != null && newState.channel == null) {
      const embed = new EmbedBuilder()
        .setTitle("Presence Update")
        .setDescription(
          `**${newState?.member?.user.tag}** has left **${oldState.channel.name}**.`,
        )
        .setColor(resolveColor("#409400"))
        .setFooter({ text: returnCurentTime() });

      try {
        await thread.send({ embeds: [embed] });
      } catch (e) {
        client.logger.error(e as Error);
      }
    }
    // Move
    else if (oldState.channel != newState.channel) {
      const embed = new EmbedBuilder()
        .setTitle("Presence Update")
        .setDescription(
          `**${newState?.member?.user.tag}** has moved from **${oldState?.channel?.name}** to **${newState?.channel?.name}**.`,
        )
        .setColor(resolveColor("#409400"))
        .setFooter({ text: returnCurentTime() });

      try {
        await thread.send({ embeds: [embed] });
      } catch (e) {
        client.logger.error(e as Error);
      }
    }
  }
}
