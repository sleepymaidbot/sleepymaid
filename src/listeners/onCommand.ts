import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class OnCommand extends Listener {
    constructor() {
        super("onCommand", {
            event: "commandStarted",
            emitter: "commandHandler"
        });
    }

    exec(message: Message) {
        return console.log(`${message.guild.name} > ${message.author.tag} > ${message.content}`);
    }
}
