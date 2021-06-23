import { BotCommand } from '../../lib/extensions/BotCommand';
import { checkUserRole, performRole } from '../../functions/rolesyncer';

export default class color_message_command extends BotCommand {
  constructor() {
		super('roles', {
			aliases: ['roles', 'updaterole', 'updatemyrole'],
			channel: 'guild'
		});
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async exec(message) {
    const member = message.member;
    // eslint-disable-next-line prefer-const
    let memberRole: string[] = [];
    member.roles.cache.forEach(role => {
      memberRole.push(role.name);
    });
    const response = checkUserRole(memberRole, memberRole);
    message.channel.send({ content: response })
    const role = message.guild.roles.cache.find(role => role.name === 'Colorful');
    performRole(response, role, member);
  }
}