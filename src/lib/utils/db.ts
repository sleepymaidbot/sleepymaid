import { config } from '../../config/config'
import { Schema, model, connect } from 'mongoose'
import { Snowflake } from 'discord.js'

interface userActivity {
	id: Snowflake
	points: number
}

const userActivitySchema = new Schema<userActivity>(
	{
		id: { type: String, required: true, index: true },
		points: { type: Number, required: true, default: 0 }
	},
	{ collection: 'activity' }
)

export const userActivityModel = model<userActivity>(
	'activity',
	userActivitySchema
)

export async function startDB(): Promise<void> {
	await connect(config.db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	})
}
