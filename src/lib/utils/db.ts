import { Schema, model } from 'mongoose'
import { Snowflake } from 'discord.js'

// mondecorte

export interface mondecorte {
	id: Snowflake
	points: number
	crole?: Snowflake
	vote?: Snowflake
}

const mondecorteSchema = new Schema<mondecorte>(
	{
		id: { type: String, required: true, index: true },
		points: { type: Number, required: true, default: 0 },
		crole: { type: String, index: true },
		vote: { type: String, default: null }
	},
	{ collection: 'mondecorte' }
)

export const mondecorteModel = model<mondecorte>('mondecorte', mondecorteSchema)
