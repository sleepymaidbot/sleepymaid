import { config } from '../../config/config'
import { Schema, model, connect } from 'mongoose'
import { Snowflake } from 'discord.js'

export async function startDB(): Promise<void> {
	await connect(config.db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	})
}

// userActivity

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

// Custom role

interface customRole {
	id: Snowflake
	role: Snowflake
}

const customRoleSchema = new Schema<customRole>(
	{
		id: { type: String, required: true, index: true },
		role: { type: String, required: true, index: true }
	},
	{ collection: 'customRole' }
)

export const customRoleModel = model<customRole>('customRole', customRoleSchema)
