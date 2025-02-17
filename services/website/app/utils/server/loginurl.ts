import { createServerFn } from "@tanstack/start";
import * as arctic from "arctic";
import { OAuth2Scopes } from "discord-api-types/v10";
import { discord } from "../auth";

const createDiscordLoginURL = async () => {
	const state = await arctic.generateState();
	const scopes: OAuth2Scopes[] = [OAuth2Scopes.Identify, OAuth2Scopes.Guilds];
	const url = await discord.createAuthorizationURL(state, null, scopes);
	return url.toString();
};

export const getLoginRedirectURL = createServerFn({
	method: "GET",
}).handler(async () => {
	return await createDiscordLoginURL();
});
