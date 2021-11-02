import { Message } from "discord.js";

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message: Message) {
        if (message.content.toLowerCase().startsWith('!ban')) {
            if (message.member.permissions.has('BAN_MEMBERS')) {
                const user = message.content.split(' ').slice(1).join(' ')
                await message.channel.send(`${user} a été banne. :banana: `)
            }
        }
    }
}