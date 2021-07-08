import monk from 'monk';
const db = monk(config.mongodb);
export const activity = db.get('activity');
activity.createIndex({ id: 1 }, { unique: true });
