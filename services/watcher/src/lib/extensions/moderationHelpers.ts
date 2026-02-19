import { modCase, userData } from "@sleepymaid/db"
import type { DrizzleInstance } from "@sleepymaid/db"

const MAX_REASON_LENGTH = 4000

export function validateReason(reason: string | null | undefined): string | null {
	if (!reason) return null
	const trimmed = reason.trim()
	if (trimmed.length === 0) return null
	if (trimmed.length > MAX_REASON_LENGTH) {
		throw new Error(`Reason must be ${MAX_REASON_LENGTH} characters or less.`)
	}
	return trimmed
}

export async function upsertUserData(
	drizzle: DrizzleInstance,
	userId: string,
	userName: string,
	displayName: string | null,
): Promise<void> {
	await drizzle
		.insert(userData)
		.values({
			userId,
			userName,
			displayName,
		})
		.onConflictDoUpdate({
			target: userData.userId,
			set: { userName, displayName },
		})
}

export async function createModCase(
	drizzle: DrizzleInstance,
	guildId: string,
	caseNumber: number,
	messageId: string,
	userId: string,
	type: "warn" | "timeout" | "untimeout" | "kick" | "ban" | "unban",
	modId: string,
	reason?: string | null,
	expiresAt?: Date,
): Promise<void> {
	await drizzle.insert(modCase).values({
		guildId,
		caseNumber,
		messageId,
		userId,
		reason: reason ?? null,
		type,
		modId,
		expiresAt,
	})
}
