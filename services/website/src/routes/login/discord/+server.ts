import { generateState } from "arctic";
import { discord } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";
import { OAuth2Scopes } from "discord-api-types/v10";

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const scopes: OAuth2Scopes[] = [OAuth2Scopes.Identify, OAuth2Scopes.Guilds];
	const url = discord.createAuthorizationURL(state, scopes);

	event.cookies.set("discord_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
}
