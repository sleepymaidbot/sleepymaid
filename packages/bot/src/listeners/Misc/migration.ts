import { connect, Schema, model } from 'mongoose'
import { Snowflake } from 'discord.js'
import { config } from '../../config/config'

module.exports = {
	name: 'ready',
	once: true,

	async execute(client) {
		await connect(config.db)
			.catch((err) => client.logger.error(err))
			.then(() => client.logger.info('Successfully loaded MongoDB.'))
		const mondecorteSchema = new Schema<mondecorte>(
			{
				id: { type: String, required: true, index: true },
				points: { type: Number, required: true, default: 0 },
				crole: { type: String, index: true },
				vote: { type: String, default: null },
				socialcredit: { type: Number, required: true, default: 500 }
			},
			{ collection: 'mondecorte' }
		)

		const mondecorteModel = model<mondecorte>('mondecorte', mondecorteSchema)

		await mondecorteModel.find({}).then(async (docs) => {
			docs.forEach(async (doc) => {
				await client.prisma.mondecorte.create({
					data: {
						user_id: doc.id,
						points: doc.points,
						custom_role_id: doc.crole,
						social_credit: doc.socialcredit
					}
				})
			})
		})
	}
}

interface mondecorte {
	id: Snowflake
	points: number
	crole?: Snowflake
	vote?: Snowflake
	socialcredit: number
}
