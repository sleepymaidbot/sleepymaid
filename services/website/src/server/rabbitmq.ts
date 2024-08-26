import "server-only";
import { mqConnection as importMqConnection } from "@sleepymaid/shared";
import { env } from "@/env";
import type amqp from "amqplib";

const globalForMQ = globalThis as unknown as {
	channel: amqp.Channel | undefined;
	connection: amqp.Connection | undefined;
};

const con = globalForMQ.connection ?? (await importMqConnection.connect(env.RABBITMQ_URL));

export const mqChannel = importMqConnection.channel;
export const mqConnection = con;
