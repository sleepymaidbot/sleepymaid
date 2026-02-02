import { createServerFn } from "@tanstack/start"
import { setCookie } from "@tanstack/start/server"
import * as arctic from "arctic"
import { OAuth2Scopes } from "discord-api-types/v10"
import { discord } from "../auth"

const createDiscordLoginURL = async () => {
	const state = await arctic.generateState()
	const scopes: OAuth2Scopes[] = [OAuth2Scopes.Identify, OAuth2Scopes.Guilds]
	const url = await discord.createAuthorizationURL(state, null, scopes)
	return { url: url.toString(), state }
}

export const getLoginRedirectURL = createServerFn({
	method: "GET",
}).handler(async () => {
	console.log("getLoginRedirectURL")
	const { url, state } = await createDiscordLoginURL()
	setCookie("loginState", state, {
		expires: new Date(Date.now() + 1000 * 60 * 5),
		secure: process.env.NODE_ENV === "production",
	})
	return { url }
})
