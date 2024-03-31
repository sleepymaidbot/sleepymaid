// Schema imports
import * as randombitrate from './schema/helper/randombitrate';
import * as leveling from './schema/sleepymaid/leveling';
import * as mondecorte from './schema/sleepymaid/mondecorte';
import * as schemas from './schema/sleepymaid/schema';
import * as watcher from './schema/watcher/watcher';
import * as website from './schema/website/website';

export const schema = { ...schemas, ...randombitrate, ...website, ...watcher, ...leveling, ...mondecorte };

export * from './schema/sleepymaid/schema';
export * from './schema/helper/randombitrate';
export * from './schema/website/website';
export * from './schema/watcher/watcher';
export * from './schema/sleepymaid/leveling';
export * from './schema/sleepymaid/mondecorte';
