import { createDrizzleInstance, type DrizzleInstance } from "@sleepymaid/db";
import { DATABASE_URL } from "$env/static/private";
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
export const db: DrizzleInstance = createDrizzleInstance(DATABASE_URL);
