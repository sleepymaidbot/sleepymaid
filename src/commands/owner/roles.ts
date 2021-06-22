import { BotCommand } from '../../lib/extensions/BotCommand';
import { checkUserRole } from '../../functions/rolesyncer';

export default class color_message_command extends BotCommand {
  constructor() {
		super('roles', {
			aliases: ['roles'],
			ownerOnly: true,
			channel: 'guild'
		});
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async exec(message) {
    message.channel.send("korro weird");
    const roles = message.member.roles.cache
    roles.map((role) => {
      console.log(role.name);
    });
  }
}