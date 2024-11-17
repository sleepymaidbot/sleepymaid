import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { PermissionFlagsBits, type APIGuild } from "discord-api-types/v10";
import { hasPermission } from "$lib/utils/permissions";

type Guild = APIGuild & {
	hasDashboardAccess?: boolean;
};

export const load: PageServerLoad = async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		throw redirect(302, "/login");
	}

	const guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
		headers: {
			Authorization: `Bearer ${event.locals.session.accessToken}`,
		},
	});

	const guildsData: Guild[] = await guilds.json();

	for (const guild of guildsData) {
		const permissions = BigInt(guild.permissions ?? 0);

		if (hasPermission(permissions, PermissionFlagsBits.ManageGuild as bigint)) {
			guild.hasDashboardAccess = true;
		}

		if (hasPermission(permissions, PermissionFlagsBits.Administrator as bigint)) {
			guild.hasDashboardAccess = true;
		}
	}

	return {
		user: event.locals.user,
		guilds: guildsData.filter((guild) => guild.hasDashboardAccess),
	};
};
