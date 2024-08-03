import { Buffer } from "node:buffer";
import { createId } from "@paralleldrive/cuid2";
import type amqp from "amqplib";
import type { Channel, Connection } from "amqplib";
import { connect } from "amqplib";

export enum Queue {
	CheckGuildInformation = "check_guild_information",
	// CheckGuildRoles = 'check_guild_roles',
}

export type CheckGuildInformationRequestMessage = {
	guildId: string;
	userId: string;
};

export type CheckGuildInformationResponseRolesMessage = {
	color: string;
	id: string;
	name: string;
	position: number;
};

export type CheckGuildInformationResponseMessage = {
	botNickname: string;
	channels: {
		id: string;
		name: string;
	}[];
	emojis: {
		id: string;
		name: string;
	}[];
	hasBot: boolean;
	hasPermission: boolean;
	roles: CheckGuildInformationResponseRolesMessage[];
	userPermissions: string;
};

export type RequestType = {
	[Queue.CheckGuildInformation]: CheckGuildInformationRequestMessage;
	// [Queue.CheckGuildRoles]: CheckGuildRolesRequestMessage;
};

export type ResponseType = {
	[Queue.CheckGuildInformation]: CheckGuildInformationResponseMessage;
	// [Queue.CheckGuildRoles]: CheckGuildRolesResponseMessage;
};

export async function sendRPCRequest<Q extends Queue>(
	request: RequestType[Q],
	queueName: Q,
	channel: amqp.Channel,
): Promise<ResponseType[Q]> {
	const replyQueue = await channel.assertQueue("", { exclusive: true }); // Create a temporary reply queue
	const correlationId = createId();

	channel.sendToQueue(queueName, Buffer.from(JSON.stringify(request)), {
		// Send request to specified queue
		correlationId,
		replyTo: replyQueue.queue,
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return new Promise<ResponseType[Q]>((resolve, _reject) => {
		void channel.consume(
			replyQueue.queue,
			(msg) => {
				if (!msg) {
					return;
				}

				if (msg.properties.correlationId === correlationId) {
					const response: ResponseType[Q] = JSON.parse(msg.content.toString());
					resolve(response); // Resolve the Promise with the response
				}
			},
			{ noAck: true },
		);
	});
}

class RabbitMQConnection {
	public connection!: Connection;

	public channel!: Channel;

	public rabbitMQConnected!: boolean;

	public async connect(url: string): Promise<amqp.Connection | null> {
		if (this.rabbitMQConnected && this.channel) return null;
		else this.rabbitMQConnected = true;

		try {
			console.log(`⌛️ Connecting to Rabbit-MQ Server`);
			this.connection = await connect(url);

			console.log(`✅ Rabbit MQ Connection is ready`);

			this.channel = await this.connection.createChannel();

			console.log(`🛸 Created RabbitMQ Channel successfully`);
			return this.connection;
		} catch (error) {
			console.error(error);
			console.error(`Not connected to MQ Server`);
			return null;
		}
	}
}

export const mqConnection = new RabbitMQConnection();
