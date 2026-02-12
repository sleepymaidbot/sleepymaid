import { type Context, Task } from '@sleepymaid/handler';
import { GameDig } from 'gamedig';
import type { HelperClient } from '../lib/extensions/HelperClient';

const enabled = false;

export default class extends Task<HelperClient> {
  public constructor(context: Context<HelperClient>) {
    super(context, {
      interval: '*/5 * * * *',
      runOnStart: true,
    });
  }

  public override async execute() {
    if (!enabled) return;
    const client = this.container.client;
    client.logger.debug('Alpha network task started');

    GameDig.query({
      type: 'minecraft',
      host: 'alpha.hypixel.net',
      port: 25565,
    })
      .then((result) => {
        const maxplayers = result.maxplayers;
        const numplayers = result.numplayers;

        client.logger.debug(
          `Max players: ${maxplayers}, Num players: ${numplayers}`,
        );

        const guild = client.guilds.cache.get('821717486217986098');
        if (!guild) return;

        const channel = guild.channels.cache.get('1467994738199363727');
        if (!channel || !channel.isSendable()) return;

        if (maxplayers === 0) return;

        channel.send(
          `**Alpha Network**\nMax players: ${maxplayers}, Num players: ${numplayers}`,
        );
      })
      .catch((error) => {
        return;
      });
  }
}
