import { Inhibitor } from 'discord-akairo';
import * as blacklistfile from '../config/blacklist';

class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('blacklist', {
            reason: 'blacklist'
        })
    }

    exec(message) {
        const blacklist = blacklistfile.blacklist;
        return blacklist.includes(message.author.id);
    }
}

module.exports = BlacklistInhibitor;