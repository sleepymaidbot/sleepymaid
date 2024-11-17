import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/auth";
import { discord } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { userData } from "@sleepymaid/db";

import type { RequestEvent } from "@sveltejs/kit";
import { ArcticFetchError, OAuth2RequestError, type OAuth2Tokens } from "arctic";
import type { APIUser } from "discord-api-types/v10";
import { eq } from "drizzle-orm";

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("discord_oauth_state") ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens | undefined;
	try {
		tokens = await discord.validateAuthorizationCode(code);
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			const code = e.code;
			console.error(code);
		}
		if (e instanceof ArcticFetchError) {
			const cause = e.cause;
			console.error(cause);
		}
		console.error(e);
	}

	if (tokens === undefined) {
		return new Response(null, {
			status: 400,
		});
	}

	const accessToken = tokens.accessToken();
	const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
	const refreshToken = tokens.refreshToken();

	const response = await fetch("https://discord.com/api/users/@me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const discordUser: APIUser = await response.json();
	const discordUserId = discordUser.id;
	const discordUsername = discordUser.username;
	const discordDisplayName = discordUser.global_name;
	const discordAvatar = discordUser.avatar;

	const existingUser = await db.query.userData.findFirst({
		where: eq(userData.userId, discordUserId),
	});

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(
			sessionToken,
			existingUser.userId,
			accessToken,
			accessTokenExpiresAt,
			refreshToken,
		);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/",
			},
		});
	}

	const userInsert = await db
		.insert(userData)
		.values({
			userId: discordUserId,
			userName: discordUsername,
			displayName: discordDisplayName,
			avatarHash: discordAvatar,
		})
		.returning();

	const user = userInsert[0];
	if (!user) {
		return new Response(null, {
			status: 500,
		});
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.userId, accessToken, accessTokenExpiresAt, refreshToken);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/",
		},
	});
}
