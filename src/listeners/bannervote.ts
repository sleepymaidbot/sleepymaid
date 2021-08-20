import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class BannervoteListener extends Listener {
    constructor() {
        super("bannervote", {
            emitter: 'client',
			event: 'messageCreate'
        });
    }

    async exec(message: Message) {
        if (message.channel.id === '878370280941183016') {
            message.react('✅')
            message.react('❌')
        }
    }
}