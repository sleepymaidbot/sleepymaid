import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { mondecorteModel } from '../../lib/utils/db'

export default class ZackMoment extends Command {
    constructor() {
        super('zackmoment', {
            aliases: ['zackmoment'],
            category: 'Owner',
            ownerOnly: true
        });
    }

    public async exec(message: Message) {
        mondecorteModel.find({}).then(async (docs) => {
            const role = await message.guild.roles.cache.find(r => r.id === '880950592615354429')
            for (const doc of docs) {
                if (doc.vote === '632688192209944586') {
                    const member = await message.guild.members.cache.find(m => m.id === doc.id)
                    await member.roles.add(role)
                }
            }

        })
    }

}