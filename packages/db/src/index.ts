import { drizzle } from "drizzle-orm/node-postgres";
// Schema imports
import * as randombitrate from "./schema/helper/randombitrate";
import * as economy from "./schema/sleepymaid/economy";
import * as fun from "./schema/sleepymaid/fun";
import * as leveling from "./schema/sleepymaid/leveling";
import * as mondecorte from "./schema/sleepymaid/mondecorte";
import * as quickMessage from "./schema/sleepymaid/quickMessage";
import * as roleMenu from "./schema/sleepymaid/rolemenu";
import * as schemas from "./schema/sleepymaid/schema";
import * as website from "./schema/sleepymaid/website";
import * as watcher from "./schema/watcher/watcher";

// Schema object
export const schema = {
	...economy,
	...randombitrate,
	...fun,
	...leveling,
	...mondecorte,
	...quickMessage,
	...roleMenu,
	...schemas,
	...watcher,
	...website,
};

export function createDrizzleInstance(connectionString: string) {
	return drizzle({ schema, connection: { connectionString } });
}

export type DrizzleInstance = ReturnType<typeof createDrizzleInstance>;

// Export all schemas
export * from "./schema/helper/randombitrate";
export * from "./schema/sleepymaid/economy";
export * from "./schema/sleepymaid/fun";
export * from "./schema/sleepymaid/leveling";
export * from "./schema/sleepymaid/mondecorte";
export * from "./schema/sleepymaid/quickMessage";
export * from "./schema/sleepymaid/rolemenu";
export * from "./schema/sleepymaid/schema";
export * from "./schema/sleepymaid/website";
export * from "./schema/watcher/watcher";
