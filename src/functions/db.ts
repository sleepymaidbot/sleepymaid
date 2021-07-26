import * as config from '../config/options';
import { Schema, model, connect } from 'mongoose';
import { Snowflake } from 'discord.js';

interface userActivity {
	id: Snowflake;
	points: number;
}

const userActivitySchema = new Schema<userActivity>(
	{
		id: { type: String, required: true, index: true },
		points: { type: Number, required: true, default: 0 }
	},
	{ collection: 'activity' }
);

export const userActivityModel = model<userActivity>(
	'activity',
	userActivitySchema
);

run().catch((err) => console.log(err));

async function run(): Promise<void> {
	await connect(config.mongourl, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}
