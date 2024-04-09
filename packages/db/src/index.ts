// Schema imports
import * as randombitrate from './schema/helper/randombitrate';
import * as leveling from './schema/sleepymaid/leveling';
import * as mondecorte from './schema/sleepymaid/mondecorte';
import * as roleMenu from './schema/sleepymaid/rolemenu';
import * as schemas from './schema/sleepymaid/schema';
import * as watcher from './schema/watcher/watcher';
import * as website from './schema/website/website';

// Schema object
export const schema = {
	...randombitrate,
	...leveling,
	...mondecorte,
	...roleMenu,
	...schemas,
	...watcher,
	...website,
};

// Export all schemas
export * from './schema/helper/randombitrate';
export * from './schema/sleepymaid/leveling';
export * from './schema/sleepymaid/mondecorte';
export * from './schema/sleepymaid/rolemenu';
export * from './schema/sleepymaid/schema';
export * from './schema/watcher/watcher';
export * from './schema/website/website';
