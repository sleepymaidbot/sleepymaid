import * as arctic from "arctic"

const clientId = process.env.DISCORD_CLIENT_ID
const clientSecret = process.env.DISCORD_CLIENT_SECRET
const redirectURI = process.env.DISCORD_REDIRECT_URI

if (!clientId || !clientSecret || !redirectURI) {
	throw new Error("DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI must be set")
}

export const discord = new arctic.Discord(clientId, clientSecret, redirectURI)
