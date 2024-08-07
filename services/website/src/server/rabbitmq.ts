import "server-only";
import { mqConnection as importMqConnection } from "@sleepymaid/shared";
import { env } from "@/env";

await importMqConnection.connect(env.RABBITMQ_URL);

export const mqChannel = importMqConnection.channel;
export const mqConnection = importMqConnection.connection;
