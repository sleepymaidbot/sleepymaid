import { Prisma, LogChannelType } from '@prisma/client';

export type modLogChannelType = {
	timeout: boolean;
	untimeout: boolean;
	kick: boolean;
	ban: boolean;
	unban: boolean;
};

export type serverLogChannelType = {
	messageEdit: boolean;
	messageDelete: boolean;
	memberJoin: boolean;
	memberLeave: boolean;
	memberBan: boolean;
	memberUnban: boolean;
	memberNicknameChange: boolean;
	memberRoleChange: boolean;
	memberAvatarChange: boolean;
	memberUsernameChange: boolean;
};

export function createEmptySubscribedLogsObject(type: LogChannelType): Prisma.JsonObject {
	let obj: Prisma.JsonObject = {};
	if (type === LogChannelType.mod) {
		obj = {
			timeout: false,
			untimeout: false,
			kick: false,
			ban: false,
			unban: false,
		} as modLogChannelType;
	} else if (type === LogChannelType.server) {
		obj = {
			messageEdit: false,
			messageDelete: false,
			memberJoin: false,
			memberLeave: false,
			memberBan: false,
			memberUnban: false,
			memberNicknameChange: false,
			memberRoleChange: false,
			memberAvatarChange: false,
			memberUsernameChange: false,
		} as serverLogChannelType;
	}
	return obj;
}
