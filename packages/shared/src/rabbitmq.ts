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
		userPermissions: string;
	};
	[Queue.SendQuickMessage]: {
		messageId: string;
	};
};
