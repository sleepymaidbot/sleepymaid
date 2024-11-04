import "server-only";
import { RabbitMQConnection } from "@sleepymaid/shared";
import { env } from "@/env";
import type amqp from "amqplib";

const globalForMQ = globalThis as unknown as {
	channel: amqp.Channel | undefined;
	connection: amqp.Connection | undefined;
};

const con = globalForMQ.connection ?? (await RabbitMQConnection.getInstance().connect(env.RABBITMQ_URL));

export const mqChannel = RabbitMQConnection.getInstance().channel;
export const mqConnection = con;
