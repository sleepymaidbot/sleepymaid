import { Schema, model } from 'mongoose'
import { Snowflake } from 'discord.js'

// mondecorte

export interface mondecorte {
	id: Snowflake
	points: number
	crole?: Snowflake
	vote?: Snowflake
	socialcredit: number
}

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

export const mondecorteModel = model<mondecorte>('mondecorte', mondecorteSchema)
