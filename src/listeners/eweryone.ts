import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class eweryone extends Listener {
    constructor() {
        super("eweryone", {
            emitter: 'client',
            event: 'messageCreate'
        }
        );
    }

    async exec(message: Message) {
        if (message.content.match(/(@everyone)/)) {
            if (message.member.roles.cache.has('876636031884087406')) return
            const role = message.guild.roles.cache.find(role => role.id === '876636031884087406')
            message.member.roles.add(role);
        } else if (message.content.match(/(remove h role)/)) {
            if (message.member.roles.cache.has('876636031884087406')) {
                message.channel.send({
                    content: `<@${message.author.id}>, okay, ive wemoved h role fwom u but pwease be mowre caweful next time (≧◡≦)`
                })
                const role = message.guild.roles.cache.find(role => role.id === '876636031884087406')
                message.member.roles.remove(role);
            }
        }
    }
}