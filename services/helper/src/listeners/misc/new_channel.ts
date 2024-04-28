import type { ListenerInterface } from "@sleepymaid/handler";
import { ChannelType } from "discord-api-types/v10";
import type { Message } from "discord.js";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class AutoPublishListener implements ListenerInterface {
  public readonly name = "messageCreate";
  public readonly once = false;

  public async execute(message: Message, client: HelperClient) {
    if (
      message.channel.type === ChannelType.GuildNews &&
      message.channel.id === "962902965914570812" &&
      message.webhookId === "970352678993530940"
    ) {
      message.crosspost().catch(client.logger.error);
    }
  }
}
