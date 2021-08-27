import { Command } from 'discord-akairo'
import { mondecorteModel, mondecorte } from '../../lib/utils/db'

const userVote = {}

const findHighest = (obj) => {
	const values = Object.values(obj)
	// eslint-disable-next-line prefer-spread
	const max = Math.max.apply(Math, values)
	for (const key in obj) {
		if (obj[key] === max) {
			return [key, max]
		}
	}
}

export default class extends Command {
	constructor() {
		super('compilevote', {
			aliases: ['compilevote'],
			ownerOnly: true
		})
	}

	async exec(message) {
		mondecorteModel.find({}).then((docs: Array<mondecorte>) => {
			docs.forEach(async (doc) => {
				if (doc.vote) {
					if (userVote[doc.vote]) {
						userVote[doc.vote] = userVote[doc.vote] + 1
					} else {
						userVote[doc.vote] = 1
					}
				}
			})

			message.channel.send(`The highest vote is ${findHighest(userVote)[0]}`)
		})
	}
}
