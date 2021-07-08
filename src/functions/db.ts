import monk from 'monk';
import * as config from '../config/options';
const db = monk(config.mongodb);
export const activity = db.get('activity');
activity.createIndex({ id: 1 }, { unique: true });
