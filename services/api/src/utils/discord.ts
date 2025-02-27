import * as storage from "./storage";
import { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

export type Tokens = RESTPostOAuth2AccessTokenResult & {
	expires_at: number;
};

export function getOAuthUrl() {
	const state = crypto.randomUUID();

	const url = new URL("https://discord.com/api/oauth2/authorize");
	url.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
	url.searchParams.set("redirect_uri", process.env.DISCORD_REDIRECT_URI!);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("state", state);
	url.searchParams.set("scope", "role_connections.write identify");
	url.searchParams.set("prompt", "consent");
	return { state, url: url.toString() };
}

export async function getOAuthTokens(code: string): Promise<Tokens> {
	const url = "https://discord.com/api/v10/oauth2/token";
	const body = new URLSearchParams({
		client_id: process.env.DISCORD_CLIENT_ID!,
		client_secret: process.env.DISCORD_CLIENT_SECRET!,
		grant_type: "authorization_code",
		code,
		redirect_uri: process.env.DISCORD_REDIRECT_URI!,
	});

	const response = await fetch(url, {
		body,
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});
	if (response.ok) {
		const data = await response.json();
		return data as Tokens;
	} else {
		throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
	}
}

export async function getUserData(tokens: { access_token: string }): Promise<APIUser> {
	const url = "https://discord.com/api/v10/oauth2/@me";
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
		},
	});
	if (response.ok) {
		const data = (await response.json()) as { user: APIUser };
		return data.user;
	} else {
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
	}
}

export async function getAccessToken(userId: string, tokens: Tokens): Promise<string> {
	if (Date.now() > tokens.expires_at) {
		const url = "https://discord.com/api/v10/oauth2/token";
		const body = new URLSearchParams({
			client_id: process.env.DISCORD_CLIENT_ID!,
			client_secret: process.env.DISCORD_CLIENT_SECRET!,
			grant_type: "refresh_token",
			refresh_token: tokens.refresh_token,
		});
		const response = await fetch(url, {
			body,
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		if (response.ok) {
			const tokens = (await response.json()) as Tokens;
			tokens.expires_at = Date.now() + tokens.expires_in * 1000;
			await storage.storeDiscordTokens(userId, tokens);
			return tokens.access_token;
		} else {
			throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
		}
	}
	return tokens.access_token;
}

export async function pushMetadata(userId: string, tokens: Tokens, metadata: any): Promise<void> {
	const url = `https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_CLIENT_ID}/role-connection`;
	const accessToken = await getAccessToken(userId, tokens);
	const body = {
		platform_name: "Sleepymaid",
		metadata,
	};
	const response = await fetch(url, {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
	}
}
