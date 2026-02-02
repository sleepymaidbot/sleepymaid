import { userData } from "@sleepymaid/db"
import { eq } from "drizzle-orm"
import { db } from "../index"
import type { Tokens } from "./discord"
import * as discord from "./discord"

export async function storeDiscordTokens(
	userId: string,
	tokens: { access_token: string; refresh_token: string; expires_at: number },
) {
	await db
		.update(userData)
		.set({
			linkedRolesAccessTokens: tokens.access_token,
			linkedRolesRefreshTokens: tokens.refresh_token,
			linkedRolesExpiresAt: new Date(tokens.expires_at),
		})
		.where(eq(userData.userId, userId))
}

export async function getDiscordTokens(userId: string): Promise<Tokens | null> {
	const user = await db.query.userData.findFirst({
		where: eq(userData.userId, userId),
	})

	if (!user) return null
	if (!user.linkedRolesAccessTokens || !user.linkedRolesRefreshTokens || !user.linkedRolesExpiresAt) return null

	return {
		access_token: user.linkedRolesAccessTokens,
		refresh_token: user.linkedRolesRefreshTokens,
		expires_at: user.linkedRolesExpiresAt.getTime(),
		expires_in: 0,
		scope: "",
		token_type: "",
	}
}

export async function updateMetadata(userId: string) {
	const tokens = await getDiscordTokens(userId)

	let metadata = {}
	try {
		const user = await db.query.userData.findFirst({
			where: eq(userData.userId, userId),
		})

		if (user) {
			metadata = {
				coins: user.currency,
			}
		}
	} catch (e: any) {
		e.message = `Error fetching external data: ${e.message}`
		console.error(e)
	}

	if (tokens) {
		await discord.pushMetadata(userId, tokens, metadata)
	}
}
