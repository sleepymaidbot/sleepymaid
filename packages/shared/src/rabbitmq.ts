import { Buffer } from "node:buffer";
import { createId } from "@paralleldrive/cuid2";
import type amqp from "amqplib";
import type { Channel, Connection } from "amqplib";
import { connect } from "amqplib";

export enum Queue {
	CheckGuildInformation = "check_guild_information",
	CheckUserGuildPermissions = "check_user_guild_permissions",
	SendQuickMessage = "send_quick_message",
}

export type RequestType = {
	[Queue.CheckGuildInformation]: {
		guildId: string;
		userId: string;
	};
	[Queue.CheckUserGuildPermissions]: {
		guildId: string;
		userId: string;
	};
	[Queue.SendQuickMessage]: {
		userId: string;
		guildId: string;
		channelId: string;
		messageId?: string;
		messageJson: string;
	};
};

export type ResponseType = {
	[Queue.CheckGuildInformation]: {
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
		roles: {
			color: string;
			id: string;
			name: string;
			position: number;
		}[];
		userPermissions: string;
	};
	[Queue.CheckUserGuildPermissions]: {
		admin: boolean;
		mod: boolean;
		userPermissions: string;
	};
	[Queue.SendQuickMessage]: {
		messageId: string;
	};
};

export async function sendRPCRequest<Q extends keyof ResponseType>(
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
