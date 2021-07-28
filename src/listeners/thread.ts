import { ThreadChannel } from "discord.js";
import { BotListener } from "../lib/extensions/BotListener";

export default class autoJoinThread extends BotListener {
    constructor() {
        super('autoJoinThread', {
            emitter: 'client',
			event: 'threadCreate'
        })
    }

    async exec(thread: ThreadChannel) {
        thread.join()
    }
}