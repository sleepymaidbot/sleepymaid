//import { drizzle } from 'drizzle-orm/node-postgres';

// Schema imports
import * as schemas from './schema/sleepymaid/schema';
import * as randombitrate from './schema/helper/randombitrate';
import * as website from './schema/website/website';
import * as watcher from './schema/watcher/watcher';
import * as mondecorte from './schema/sleepymaid/mondecorte';

export const schema = { ...schemas, ...randombitrate, ...website, ...watcher, ...mondecorte };

export * from './schema/sleepymaid/schema';
export * from './schema/helper/randombitrate';
export * from './schema/website/website';
export * from './schema/watcher/watcher';
export * from './schema/sleepymaid/mondecorte';
